
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

v2_content = read_file('index_v2.html')
v3_content = read_file('index_v3.html')

# 1. Extract V3 Tailwind Config
# Look for <script>...tailwind.config = ...</script>
v3_config_match = re.search(r'<script>\s*tailwind\.config = \{.*?\n\s*\}\s*</script>', v3_content, re.DOTALL)
if v3_config_match:
    v3_config = v3_config_match.group(0)
    # Replace V2 config with V3 config
    v2_content = re.sub(r'<script>\s*tailwind\.config = \{.*?\n\s*\}\s*</script>', v3_config, v2_content, flags=re.DOTALL)

# 2. Extract V3 Tech CSS (excluding body)
# We want the <style> block but need to filter it.
v3_style_match = re.search(r'<style>(.*?)</style>', v3_content, re.DOTALL)
if v3_style_match:
    v3_css = v3_style_match.group(1)
    # Remove body rule
    v3_css_filtered = re.sub(r'body\s*\{[^}]*\}', '', v3_css)
    # Remove slide-title rule to avoid conflict (optional, but let's keep it safe)
    # Actually, let's KEEP it but rename it to .tech-slide-title? 
    # Or just let it cascade? If I keep it, it might affect V2 slides.
    # V2 uses .slide-title. V3 uses .slide-title.
    # I'll remove .slide-title rules from the injected CSS so V2 titles stay V2.
    # But V3 slide 5 needs styling? 
    # V3 Slide 5 HTML: <h2 class="slide-title">
    # If I remove the CSS, it will use V2's styling. This is probably desired for consistency.
    v3_css_filtered = re.sub(r'\.slide-title[^}]*\}', '', v3_css_filtered)
    v3_css_filtered = re.sub(r'\.slide-title::after[^}]*\}', '', v3_css_filtered)
    v3_css_filtered = re.sub(r'\.slide-title span\.number[^}]*\}', '', v3_css_filtered)
    
    # Inject filtered CSS before </head>
    v2_content = v2_content.replace('</head>', f'<style>{v3_css_filtered}</style>\n</head>')

# 3. Extract V3 Slide 5
# Start: <!-- Slide 5: 执行力 - 需求落地 (Tech Timeline & Mindmap) -->
# End: <!-- Slide 6
v3_slide5_start = v3_content.find('<!-- Slide 5:')
v3_slide6_start = v3_content.find('<!-- Slide 6')
v3_slide5_content = v3_content[v3_slide5_start:v3_slide6_start]

# 4. Replace V2 Slide 5
# Start: <!-- Slide 5: 执行力 - 试用期工作全景 -->
# End: <!-- Slide 6
v2_slide5_start = v2_content.find('<!-- Slide 5:')
v2_slide6_start = v2_content.find('<!-- Slide 6')

new_content = v2_content[:v2_slide5_start] + v3_slide5_content + v2_content[v2_slide6_start:]

# 5. Save to index_v3.html (overwriting the full tech version with this hybrid)
write_file('index_v3.html', new_content)
print("Successfully created hybrid index_v3.html")

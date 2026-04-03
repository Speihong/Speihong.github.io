
const fs = require('fs');
const path = require('path');

const v2Path = path.join(__dirname, 'index_v2.html');
const v3Path = path.join(__dirname, 'index_v3.html');

const v2Content = fs.readFileSync(v2Path, 'utf8');
const v3Content = fs.readFileSync(v3Path, 'utf8');

// 1. Extract V3 Tailwind Config
const v3ConfigMatch = v3Content.match(/<script>\s*tailwind\.config = \{[\s\S]*?\n\s*\}\s*<\/script>/);
let newContent = v2Content;
if (v3ConfigMatch) {
    const v3Config = v3ConfigMatch[0];
    newContent = newContent.replace(/<script>\s*tailwind\.config = \{[\s\S]*?\n\s*\}\s*<\/script>/, v3Config);
}

// 2. Extract V3 Tech CSS (excluding body and slide-title)
const v3StyleMatch = v3Content.match(/<style>([\s\S]*?)<\/style>/);
if (v3StyleMatch) {
    let v3Css = v3StyleMatch[1];
    // Remove body rule
    v3Css = v3Css.replace(/body\s*\{[^}]*\}/g, '');
    // Remove slide-title rules to avoid conflict
    v3Css = v3Css.replace(/\.slide-title[^}]*\}/g, '');
    v3Css = v3Css.replace(/\.slide-title::after[^}]*\}/g, '');
    v3Css = v3Css.replace(/\.slide-title span\.number[^}]*\}/g, '');
    
    // Inject filtered CSS before </head>
    newContent = newContent.replace('</head>', `<style>${v3Css}</style>\n</head>`);
}

// 3. Extract V3 Slide 5
const v3Slide5Start = v3Content.indexOf('<!-- Slide 5:');
const v3Slide6Start = v3Content.indexOf('<!-- Slide 6', v3Slide5Start);
const v3Slide5Content = v3Content.substring(v3Slide5Start, v3Slide6Start);

// 4. Replace V2 Slide 5
const v2Slide5Start = newContent.indexOf('<!-- Slide 5:');
const v2Slide6Start = newContent.indexOf('<!-- Slide 6', v2Slide5Start);

newContent = newContent.substring(0, v2Slide5Start) + v3Slide5Content + newContent.substring(v2Slide6Start);

fs.writeFileSync(v3Path, newContent, 'utf8');
console.log("Successfully created hybrid index_v3.html");

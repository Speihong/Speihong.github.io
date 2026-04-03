document.addEventListener('DOMContentLoaded', () => {
    // 初始化 Lucide 图标 (添加容错)
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        } else {
            console.warn('Lucide library not loaded');
        }
    } catch (e) {
        console.error('Error initializing Lucide icons:', e);
    }

    // 初始化 Mermaid (添加容错)
    try {
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
        } else {
            console.warn('Mermaid library not loaded');
        }
    } catch (e) {
        console.error('Error initializing Mermaid:', e);
    }

    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlideIndex = 0;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentSlideEl = document.getElementById('current-slide');
    const totalSlidesEl = document.getElementById('total-slides');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');

    // 更新总页数
    totalSlidesEl.textContent = totalSlides;

    // 切换幻灯片函数
    function showSlide(index) {
        // 边界检查
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        currentSlideIndex = index;

        // 更新 slide 类名以触发动画
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev', 'next');
            if (i === index) {
                slide.classList.add('active');
            } else if (i < index) {
                slide.classList.add('prev');
            } else {
                slide.classList.add('next');
            }
        });

        // 更新页码
        currentSlideEl.textContent = currentSlideIndex + 1;
        
        // 派发 slideChanged 事件
        const event = new CustomEvent('slideChanged', { 
            detail: { index: currentSlideIndex + 1 } 
        });
        document.dispatchEvent(event);
        
        // 更新按钮状态
        prevBtn.style.opacity = index === 0 ? '0.3' : '';
        prevBtn.style.pointerEvents = index === 0 ? 'none' : '';
        
        nextBtn.style.opacity = index === totalSlides - 1 ? '0.3' : '';
        nextBtn.style.pointerEvents = index === totalSlides - 1 ? 'none' : '';

        const slide6 = document.querySelector('.slide[data-index="6"]');
        if (slide6) {
            slide6.classList.remove('is-active');
            if (slides[index] === slide6) {
                requestAnimationFrame(() => {
                    slide6.classList.add('is-active');
                });
            }
        }
    }

    // 下一张
    function nextSlide() {
        if (currentSlideIndex < totalSlides - 1) {
            showSlide(currentSlideIndex + 1);
        }
    }

    // 上一张
    function prevSlide() {
        if (currentSlideIndex > 0) {
            showSlide(currentSlideIndex - 1);
        }
    }

    // 事件监听
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
            case 'Enter':
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'Backspace':
                prevSlide();
                break;
            case 'f':
                toggleFullScreen();
                break;
        }
    });

    // 滚轮控制 (防抖)
    let isScrolling = false;
    document.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 800); // 800ms 冷却

        if (e.deltaY > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    });

    // 全屏切换
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', toggleFullScreen);
    }

    // 重置按钮逻辑 (使用事件委托或直接绑定)
    document.addEventListener('click', (e) => {
        // 查找最近的具有 id="restart-btn" 的祖先元素或元素本身
        const btn = e.target.closest('#restart-btn');
        if (btn) {
            showSlide(0);
        }
    });

    const collabNet = document.getElementById('collab-net');
    if (collabNet) {
        const branches = collabNet.querySelectorAll('.collab-branch[data-key]');
        branches.forEach((branch) => {
            const key = branch.getAttribute('data-key') || '';
            branch.addEventListener('mouseenter', () => {
                collabNet.setAttribute('data-active-key', key);
            });
            branch.addEventListener('mouseleave', () => {
                collabNet.setAttribute('data-active-key', '');
            });
        });
    }

    // 初始化显示第一页
    showSlide(0);
});

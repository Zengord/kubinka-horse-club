/**
 * Конный клуб «Кубинка» — JavaScript интерактивность и Scroll-Story
 * Чистый Vanilla JS без внешних фреймворков
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Управление шапкой сайта при скролле
  // =========================================================================
  const siteHeader = document.querySelector('.site-header');

  function handleHeaderScroll() {
    if (!siteHeader) return;
    if (window.scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // =========================================================================
  // 2. Мобильное полноэкранное меню
  // =========================================================================
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobileDrawer') || document.querySelector('.mobile-drawer');
  const menuIconOpen = document.querySelector('.menu-icon-open');
  const menuIconClose = document.querySelector('.menu-icon-close');
  const brandLogo = document.querySelector('.brand-logo');

  function openMobileMenu() {
    if (!mobileDrawer || !mobileMenuBtn) return;
    mobileDrawer.classList.add('open');
    if (siteHeader) siteHeader.classList.add('menu-open');
    document.body.classList.add('menu-open');
    document.documentElement.classList.add('menu-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.setAttribute('aria-label', 'Закрыть меню');
    if (menuIconOpen) menuIconOpen.style.display = 'none';
    if (menuIconClose) menuIconClose.style.display = 'block';
  }

  function closeMobileMenu() {
    if (!mobileDrawer || !mobileMenuBtn) return;
    mobileDrawer.classList.remove('open');
    if (siteHeader) siteHeader.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('menu-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.setAttribute('aria-label', 'Открыть меню');
    if (menuIconOpen) menuIconOpen.style.display = 'block';
    if (menuIconClose) menuIconClose.style.display = 'none';
  }

  function toggleMobileMenu() {
    if (!mobileDrawer) return;
    const isOpen = mobileDrawer.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // Закрывать меню по Escape для доступности
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Закрывать меню при клике по логотипу
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // Закрывать меню при переходе на десктопный размер
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // =========================================================================
  // Плавная математическая прокрутка ко всем якорям (Smooth Scroll Engine)
  // =========================================================================
  function smoothScrollTo(target, duration = 800) {
    let targetTop = 0;

    if (typeof target === 'number') {
      targetTop = target;
    } else if (typeof target === 'string') {
      if (target === '#' || target === '#top' || target === '') {
        targetTop = 0;
      } else {
        const el = document.querySelector(target);
        if (!el) return;
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 64;
        const rect = el.getBoundingClientRect();
        targetTop = rect.top + window.pageYOffset - headerHeight;
      }
    } else if (target instanceof Element) {
      const headerHeight = siteHeader ? siteHeader.offsetHeight : 64;
      const rect = target.getBoundingClientRect();
      targetTop = rect.top + window.pageYOffset - headerHeight;
    }

    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    targetTop = Math.max(0, Math.min(targetTop, maxScroll));

    const startTop = window.pageYOffset;
    const distance = targetTop - startTop;
    if (Math.abs(distance) < 2) return;

    // Плавная кривая easeInOutCubic для благородного кинематографичного движения
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startTop + distance * ease);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  // Делегированный перехват кликов по ВСЕМ якорным ссылкам на сайте
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Игнорируем специальные элементы или вкладки
    if (link.getAttribute('role') === 'tab') return;

    e.preventDefault();

    // Закрываем мобильное меню, если оно было открыто
    if (mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileMenu();
    }

    // Если клик по ссылке наверх (#) или по логотипу
    if (href === '#' || href === '#top') {
      smoothScrollTo(0, 800);
      if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.pathname);
      }
      return;
    }

    // Ссылка на конкретную секцию по ID
    const targetEl = document.querySelector(href);
    if (targetEl) {
      smoothScrollTo(targetEl, 850);
      if (window.history && window.history.pushState) {
        window.history.pushState(null, null, href);
      }
    }
  });

  // Предотвращать прокрутку фона страницы на сенсорных экранах, пока бургер открыт
  document.addEventListener(
    'touchmove',
    (e) => {
      if (document.body.classList.contains('menu-open')) {
        if (!e.target.closest('#mobileDrawer')) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );

  // =========================================================================
  // 3. Аккордеон FAQ
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isCurrentlyOpen = item.classList.contains('open');

      // Закрываем все открытые вопросы (поведение как в исходном компоненте)
      faqItems.forEach((el) => {
        el.classList.remove('open');
        const b = el.querySelector('.faq-question-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      // Если текущий был закрыт — открываем его
      if (!isCurrentlyOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // =========================================================================
  // 4. Hero Scroll-Story на 6 фотографиях с кинематографичным параллаксом
  // Порядок: 1.png -> 2.png -> 5.png -> 3.png -> 6.png -> 4.png
  // =========================================================================
  const heroContainer = document.getElementById('heroScrollContainer');
  const mediaStack = document.querySelector('.hero-media-stack');
  const slides = document.querySelectorAll('.hero-slide');
  const texts = document.querySelectorAll('.hero-story-text');
  const veil = document.querySelector('.hero-subtle-veil');
  const ambientGlow = document.querySelector('.hero-ambient-glow');
  const storiesWrapper = document.querySelector('.hero-stories-wrapper');
  const taglineWrapper = document.querySelector('.hero-tagline-wrapper');
  const bottomActions = document.querySelector('.hero-bottom-actions');
  const stepperBtns = document.querySelectorAll('.hero-story-stepper .stepper-btn');
  const stepperProgressFill = document.querySelector('.stepper-progress-fill');
  const mobileBars = document.querySelectorAll('.hero-mobile-bar');
  const mobileCount = document.querySelector('.hero-mobile-stepper-count');
  const mobileLabel = document.querySelector('.hero-mobile-stepper-label');

  const storySteps = [
    { num: '01', title: 'Первый шаг' },
    { num: '02', title: 'Встреча' },
    { num: '03', title: 'Ритм' },
    { num: '04', title: 'Простор' },
    { num: '05', title: 'Обучение' },
    { num: '06', title: 'Финал' }
  ];

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Отложенная загрузка слайдов 2-6 для максимального Lighthouse FCP/LCP
  function loadHeroDeferredImages() {
    const deferredImages = document.querySelectorAll('.hero-slide img[data-src]');
    if (!deferredImages.length) return;
    deferredImages.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadHeroDeferredImages, { timeout: 1000 });
  } else {
    setTimeout(loadHeroDeferredImages, 150);
  }

  window.addEventListener('scroll', loadHeroDeferredImages, { once: true, passive: true });
  window.addEventListener('touchstart', loadHeroDeferredImages, { once: true, passive: true });
  window.addEventListener('mousemove', loadHeroDeferredImages, { once: true, passive: true });

  // Общий переход к конкретному шагу истории по клику
  function scrollToStoryStep(step) {
    if (!heroContainer) return;
    const totalScrollable = heroContainer.offsetHeight - window.innerHeight;
    if (totalScrollable > 0) {
      const stepPlateaus = [0.04, 0.22, 0.41, 0.59, 0.78, 0.96];
      const targetProgress = stepPlateaus[step] !== undefined ? stepPlateaus[step] : (step / 5);
      const targetTop = heroContainer.offsetTop + targetProgress * totalScrollable;
      smoothScrollTo(targetTop, 600);
    }
  }

  // Обновление состояния десктопного и мобильного степпера
  function updateStoryStepperUI(activeIdx, progress) {
    if (stepperBtns.length > 0) {
      stepperBtns.forEach((btn, idx) => {
        if (idx === activeIdx) {
          btn.classList.add('active');
          btn.setAttribute('aria-current', 'step');
        } else {
          btn.classList.remove('active');
          btn.removeAttribute('aria-current');
        }
      });
    }

    if (stepperProgressFill) {
      const fillPercent = Math.min(Math.max(progress * 100, 0), 100);
      stepperProgressFill.style.height = fillPercent + '%';
    }

    if (mobileBars.length > 0) {
      mobileBars.forEach((bar, idx) => {
        if (idx <= activeIdx) {
          bar.classList.add('active');
        } else {
          bar.classList.remove('active');
        }
        bar.setAttribute('aria-selected', idx === activeIdx ? 'true' : 'false');
      });
    }

    if (mobileCount && storySteps[activeIdx]) {
      mobileCount.textContent = storySteps[activeIdx].num + ' / 06';
    }

    if (mobileLabel && storySteps[activeIdx]) {
      mobileLabel.textContent = storySteps[activeIdx].title;
    }
  }

  // Клик по шагам десктопного степпера
  if (stepperBtns.length > 0) {
    stepperBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.getAttribute('data-step') || '0', 10);
        scrollToStoryStep(step);
      });
    });
  }

  // Клик по шагам мобильного степпера (интерактивные сторис-полоски)
  if (mobileBars.length > 0) {
    mobileBars.forEach((bar) => {
      bar.addEventListener('click', (e) => {
        e.stopPropagation();
        const step = parseInt(bar.getAttribute('data-step') || '0', 10);
        scrollToStoryStep(step);
      });
    });
  }

  if (!motionQuery.matches && heroContainer && slides.length === 6) {
    if (window.gsap && window.ScrollTrigger) {
      initGsapScrollStory();
    } else {
      initVanillaScrollStory();
    }

    // Интерактивный лёгкий курсорный параллакс (только для десктопа с мышью)
    initMouseParallax();
  }

  function initGsapScrollStory() {
    gsap.registerPlugin(ScrollTrigger);

    // Начальные параметры слайдов
    slides.forEach((slide, idx) => {
      gsap.set(slide, {
        autoAlpha: idx === 0 ? 1 : 0,
        scale: idx === 0 ? 1.01 : 1.03,
        xPercent: 0,
        yPercent: 0,
        transformOrigin: '50% 50%',
      });
    });

    // Начальные параметры текстов: строго виден только текст 0
    texts.forEach((text, idx) => {
      gsap.set(text, {
        autoAlpha: idx === 0 ? 1 : 0,
        y: idx === 0 ? 0 : 14,
      });
    });

    if (veil) {
      gsap.set(veil, { opacity: 0 });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.45,
        snap: {
          snapTo: [0, 0.20, 0.40, 0.60, 0.80, 1.0],
          duration: { min: 0.2, max: 0.45 },
          delay: 0.1,
          ease: 'power2.out',
        },
        onUpdate: (self) => {
          const p = self.progress;
          let activeIdx = 0;
          if (p < 0.15) activeIdx = 0;
          else if (p < 0.33) activeIdx = 1;
          else if (p < 0.51) activeIdx = 2;
          else if (p < 0.69) activeIdx = 3;
          else if (p < 0.87) activeIdx = 4;
          else activeIdx = 5;

          updateStoryStepperUI(activeIdx, p);
        },
      },
    });

    // ШАГ 0 -> ШАГ 1 (1.png -> 2.png)
    // Плато шага 0: 0.00 .. 0.09
    tl.to(slides[0], { scale: 1.05, yPercent: -1, duration: 0.18, ease: 'none' }, 0)
      // Текст 0 гаснет строго к 0.13
      .to(texts[0], { autoAlpha: 0, y: -10, duration: 0.05, ease: 'power1.in' }, 0.08)
      // Кадр 2 проявляется с 0.10 по 0.18
      .fromTo(slides[1], { autoAlpha: 0, scale: 1.02, xPercent: -2, yPercent: 1 }, { autoAlpha: 1, duration: 0.08, ease: 'power1.inOut' }, 0.10)
      .to(slides[1], { scale: 1.05, xPercent: 1.2, yPercent: -1, duration: 0.24, ease: 'none' }, 0.10)
      // Текст 1 появляется СТРОГО в 0.14 (после полного сокрытия текста 0 в 0.13)
      .fromTo(texts[1], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power1.out' }, 0.14);

    // ШАГ 1 -> ШАГ 2 (2.png -> 5.png)
    // Плато шага 1: 0.19 .. 0.26
    tl.to(texts[1], { autoAlpha: 0, y: -10, duration: 0.05, ease: 'power1.in' }, 0.27)
      .fromTo(slides[2], { autoAlpha: 0, scale: 1.01, xPercent: 2 }, { autoAlpha: 1, duration: 0.08, ease: 'power1.inOut' }, 0.28)
      .to(slides[2], { scale: 1.05, xPercent: -1.5, yPercent: -1, duration: 0.24, ease: 'none' }, 0.28)
      // Текст 2 появляется строго в 0.32
      .fromTo(texts[2], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power1.out' }, 0.32);

    // ШАГ 2 -> ШАГ 3 (5.png -> 3.png)
    // Плато шага 2: 0.37 .. 0.44
    tl.to(texts[2], { autoAlpha: 0, y: -10, duration: 0.05, ease: 'power1.in' }, 0.45)
      .fromTo(slides[3], { autoAlpha: 0, scale: 1.06, yPercent: 1.5 }, { autoAlpha: 1, duration: 0.08, ease: 'power1.inOut' }, 0.46)
      .to(slides[3], { scale: 1.01, yPercent: -1, duration: 0.24, ease: 'none' }, 0.46)
      // Текст 3 появляется строго в 0.50
      .fromTo(texts[3], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power1.out' }, 0.50);

    // ШАГ 3 -> ШАГ 4 (3.png -> 6.png)
    // Плато шага 3: 0.55 .. 0.62
    if (veil) {
      tl.to(veil, { opacity: 0.22, duration: 0.05, ease: 'power1.in' }, 0.62)
        .to(veil, { opacity: 0, duration: 0.05, ease: 'power1.out' }, 0.67);
    }
    tl.to(texts[3], { autoAlpha: 0, y: -10, duration: 0.05, ease: 'power1.in' }, 0.63)
      .fromTo(slides[4], { autoAlpha: 0, scale: 1.02, xPercent: -1.5 }, { autoAlpha: 1, duration: 0.08, ease: 'power1.inOut' }, 0.64)
      .to(slides[4], { scale: 1.05, xPercent: 1.2, yPercent: -1, duration: 0.24, ease: 'none' }, 0.64)
      // Текст 4 появляется строго в 0.68
      .fromTo(texts[4], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power1.out' }, 0.68);

    // ШАГ 4 -> ШАГ 5 (6.png -> 4.png)
    // Плато шага 4: 0.73 .. 0.80
    tl.to(texts[4], { autoAlpha: 0, y: -10, duration: 0.05, ease: 'power1.in' }, 0.81)
      .fromTo(slides[5], { autoAlpha: 0, scale: 1.04, yPercent: 1.2 }, { autoAlpha: 1, duration: 0.08, ease: 'power1.inOut' }, 0.82)
      .to(slides[5], { scale: 1.01, yPercent: 0, duration: 0.18, ease: 'none' }, 0.82)
      // Текст 5 появляется строго в 0.86
      .fromTo(texts[5], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'power1.out' }, 0.86);

    // Мягкое удержание финального кадра (плато шага 5: 0.90 .. 1.00)
    tl.to(slides[5], { scale: 1.00, duration: 0.08, ease: 'none' }, 0.92);
  }

  // Интерактивный лёгкий курсорный параллакс (тихий кинематографичный объём)
  function initMouseParallax() {
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches;
    if (!isDesktop || !mediaStack) return;

    let quickMediaX = null;
    let quickMediaY = null;
    let quickGlowX = null;
    let quickGlowY = null;
    let quickStoriesX = null;
    let quickStoriesY = null;
    let quickTaglineX = null;
    let quickTaglineY = null;

    if (window.gsap) {
      quickMediaX = gsap.quickTo(mediaStack, 'x', { duration: 0.9, ease: 'power2.out' });
      quickMediaY = gsap.quickTo(mediaStack, 'y', { duration: 0.9, ease: 'power2.out' });
      if (ambientGlow) {
        quickGlowX = gsap.quickTo(ambientGlow, 'x', { duration: 1.2, ease: 'power2.out' });
        quickGlowY = gsap.quickTo(ambientGlow, 'y', { duration: 1.2, ease: 'power2.out' });
      }
      if (storiesWrapper) {
        quickStoriesX = gsap.quickTo(storiesWrapper, 'x', { duration: 0.7, ease: 'power2.out' });
        quickStoriesY = gsap.quickTo(storiesWrapper, 'y', { duration: 0.7, ease: 'power2.out' });
      }
      if (taglineWrapper) {
        quickTaglineX = gsap.quickTo(taglineWrapper, 'x', { duration: 0.6, ease: 'power2.out' });
        quickTaglineY = gsap.quickTo(taglineWrapper, 'y', { duration: 0.6, ease: 'power2.out' });
      }
    }

    function onMouseMove(e) {
      const rect = heroContainer.getBoundingClientRect();
      // Вычисляем только когда hero в поле зрения
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (quickMediaX && quickMediaY) {
        // Задний медиа-план движется противоположно курсору (глубина)
        quickMediaX(normX * -18);
        quickMediaY(normY * -12);

        // Атмосферный свет следует за источником с мягким лагом
        if (quickGlowX && quickGlowY) {
          quickGlowX(normX * 32);
          quickGlowY(normY * 20);
        }

        // Передний план (текст и бейдж) слегка смещается к курсору (стерео-эффект)
        if (quickStoriesX && quickStoriesY) {
          quickStoriesX(normX * 10);
          quickStoriesY(normY * 6);
        }

        if (quickTaglineX && quickTaglineY) {
          quickTaglineX(normX * 5);
          quickTaglineY(normY * 3);
        }
      }
    }

    function onMouseLeave() {
      if (quickMediaX && quickMediaY) {
        quickMediaX(0);
        quickMediaY(0);
        if (quickGlowX && quickGlowY) {
          quickGlowX(0);
          quickGlowY(0);
        }
        if (quickStoriesX && quickStoriesY) {
          quickStoriesX(0);
          quickStoriesY(0);
        }
        if (quickTaglineX && quickTaglineY) {
          quickTaglineX(0);
          quickTaglineY(0);
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
  }

  // Резервный механизм на чистом JS при отсутствии GSAP
  function initVanillaScrollStory() {
    if (heroContainer) {
      heroContainer.classList.add('no-gsap');
    }
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateVanillaHero();
          ticking = false;
        });
        ticking = true;
      }
    }

    function updateVanillaHero() {
      const rect = heroContainer.getBoundingClientRect();
      const totalScrollable = heroContainer.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);
      let activeIdx = 0;
      if (progress < 0.15) activeIdx = 0;
      else if (progress < 0.33) activeIdx = 1;
      else if (progress < 0.51) activeIdx = 2;
      else if (progress < 0.69) activeIdx = 3;
      else if (progress < 0.87) activeIdx = 4;
      else activeIdx = 5;

      slides.forEach((slide, idx) => {
        if (idx <= activeIdx) {
          slide.classList.add('slide-active');
        } else {
          slide.classList.remove('slide-active');
        }
      });

      texts.forEach((text, idx) => {
        if (idx === activeIdx) {
          text.classList.add('text-active');
        } else {
          text.classList.remove('text-active');
        }
      });

      updateStoryStepperUI(activeIdx, progress);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateVanillaHero();
  }
})();

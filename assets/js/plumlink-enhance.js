/* ============================================================
   PLUMLINK UI ENHANCEMENT — Motion & Interactivity
   Uses motion.dev (window.Motion) for scroll-triggered animations
   ============================================================ */

(function() {
  'use strict';

  // Respect prefers-reduced-motion
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Wait for DOM
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function() {

    // ============================================================
    // 1. HEADER GLASSMORPHISM ON SCROLL
    // ============================================================
    try {
      var header = document.querySelector('.elementor-location-header');
      if (header) {
        var scrollThreshold = 40;
        var ticking = false;
        function onScroll() {
          if (!ticking) {
            window.requestAnimationFrame(function() {
              if (window.scrollY > scrollThreshold) {
                header.classList.add('pl-scrolled');
              } else {
                header.classList.remove('pl-scrolled');
              }
              ticking = false;
            });
            ticking = true;
          }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Check initial state
      }
    } catch(e) { console.warn('PL Enhance: header scroll error', e); }

    // ============================================================
    // 2. SCROLL-TRIGGERED REVEAL ANIMATIONS (using IntersectionObserver)
    // ============================================================
    try {
      // Tag elements for reveal animation
      var sections = document.querySelectorAll('.site-main .e-con.e-parent');
      sections.forEach(function(section, idx) {
        // Headings in sections
        var headings = section.querySelectorAll('.elementor-heading-title');
        headings.forEach(function(h, i) {
          h.classList.add('pl-reveal');
          if (i > 0) h.classList.add('pl-delay-' + Math.min(i, 3));
        });

        // Text editors
        var texts = section.querySelectorAll('.elementor-widget-text-editor');
        texts.forEach(function(t, i) {
          t.classList.add('pl-reveal');
          t.classList.add('pl-delay-' + Math.min(i + 1, 3));
        });

        // Buttons
        var buttons = section.querySelectorAll('.elementor-widget-button');
        buttons.forEach(function(b) {
          b.classList.add('pl-reveal');
          b.classList.add('pl-delay-3');
        });

        // Images - alternate left/right
        var images = section.querySelectorAll('.elementor-widget-image');
        images.forEach(function(img, i) {
          if (section.querySelectorAll('.e-con.e-child').length > 1) {
            img.classList.add(i % 2 === 0 ? 'pl-reveal-left' : 'pl-reveal-right');
          } else {
            img.classList.add('pl-scale-in');
          }
          img.classList.add('pl-delay-' + Math.min(i + 1, 3));
        });
      });

      // Service cards
      var cards = document.querySelectorAll('.e-transform.e-con.e-child[data-settings*="translateY"]');
      cards.forEach(function(card, i) {
        card.classList.add('pl-reveal');
        card.classList.add('pl-delay-' + Math.min(i + 1, 5));
      });

      // Footer elements
      var footerChildren = document.querySelectorAll('.elementor-location-footer .e-con.e-child');
      footerChildren.forEach(function(el, i) {
        el.classList.add('pl-reveal');
        el.classList.add('pl-delay-' + Math.min(i + 1, 4));
      });

      // Intersection Observer for reveals
      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('pl-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
      });

      document.querySelectorAll('.pl-reveal, .pl-reveal-left, .pl-reveal-right, .pl-scale-in').forEach(function(el) {
        revealObserver.observe(el);
      });

    } catch(e) { console.warn('PL Enhance: reveal animation error', e); }

    // ============================================================
    // 3. MOTION.DEV ANIMATIONS (if available)
    // ============================================================
    try {
      if (window.Motion) {
        var M = window.Motion;

        // Animate each parent section on scroll into view
        var mainSections = document.querySelectorAll('.site-main .e-con.e-parent');
        mainSections.forEach(function(section) {
          try {
            if (M.inView) {
              M.inView(section, function() {
                // Stagger child containers
                var children = section.querySelectorAll(':scope > .e-con-inner > .e-con.e-child');
                if (children.length > 0 && M.animate) {
                  M.animate(children,
                    { opacity: [0, 1], y: [20, 0] },
                    { duration: 0.6, delay: M.stagger ? M.stagger(0.12) : 0.1, easing: [0.4, 0, 0.2, 1] }
                  );
                }
              }, { amount: 0.15 });
            }
          } catch(e) {}
        });

        // Hero heading word reveal
        try {
          var heroH1 = document.querySelector('.site-main > .page-content > .elementor > .e-con.e-parent:first-child h1.elementor-heading-title');
          if (heroH1 && M.animate) {
            var text = heroH1.textContent.trim();
            var words = text.split(/\s+/);
            heroH1.innerHTML = '';
            heroH1.style.opacity = '1';
            heroH1.style.transform = 'none';
            words.forEach(function(word, i) {
              var span = document.createElement('span');
              span.style.display = 'inline-block';
              span.style.opacity = '0';
              span.style.marginRight = '0.25em';
              span.textContent = word;
              heroH1.appendChild(span);
            });
            var wordSpans = heroH1.querySelectorAll('span');
            M.animate(wordSpans,
              { opacity: [0, 1], y: [25, 0] },
              { duration: 0.5, delay: M.stagger ? M.stagger(0.08, { start: 0.2 }) : 0.08, easing: 'ease-out' }
            );
          }
        } catch(e) { console.warn('PL Enhance: hero word reveal error', e); }

        // Button hover spring
        try {
          var allButtons = document.querySelectorAll('.elementor-button');
          allButtons.forEach(function(btn) {
            btn.addEventListener('mouseenter', function() {
              if (M.animate) {
                M.animate(btn, { scale: 1.04 }, { type: 'spring', stiffness: 400, damping: 15 });
              }
            });
            btn.addEventListener('mouseleave', function() {
              if (M.animate) {
                M.animate(btn, { scale: 1 }, { type: 'spring', stiffness: 400, damping: 20 });
              }
            });
          });
        } catch(e) {}

        // Card hover spring
        try {
          var serviceCards = document.querySelectorAll('.e-transform.e-con.e-child[data-settings*="translateY"]');
          serviceCards.forEach(function(card) {
            card.addEventListener('mouseenter', function() {
              if (M.animate) {
                M.animate(card, { y: -12, scale: 1.02 }, { type: 'spring', stiffness: 300, damping: 18 });
              }
            });
            card.addEventListener('mouseleave', function() {
              if (M.animate) {
                M.animate(card, { y: 0, scale: 1 }, { type: 'spring', stiffness: 300, damping: 20 });
              }
            });
          });
        } catch(e) {}

        // Social icon hover
        try {
          var socialIcons = document.querySelectorAll('.elementor-social-icon');
          socialIcons.forEach(function(icon) {
            icon.addEventListener('mouseenter', function() {
              if (M.animate) {
                M.animate(icon, { scale: 1.15, rotate: 5 }, { type: 'spring', stiffness: 400, damping: 12 });
              }
            });
            icon.addEventListener('mouseleave', function() {
              if (M.animate) {
                M.animate(icon, { scale: 1, rotate: 0 }, { type: 'spring', stiffness: 400, damping: 15 });
              }
            });
          });
        } catch(e) {}

        // Brand carousel logos - parallax on scroll
        try {
          var carouselSection = document.querySelector('.elementor-widget-image-carousel');
          if (carouselSection && M.scroll && M.animate) {
            M.scroll(
              M.animate(carouselSection, { x: [30, -30] }, { ease: 'linear' }),
              { target: carouselSection, offset: ['start end', 'end start'] }
            );
          }
        } catch(e) {}

        // Parallax for hero background images
        try {
          var heroBgSection = document.querySelector('.site-main > .page-content > .elementor > .e-con.e-parent:first-child');
          if (heroBgSection && M.scroll && M.animate) {
            M.scroll(
              M.animate(heroBgSection, { backgroundPositionY: ['0%', '30%'] }, { ease: 'linear' }),
              { target: heroBgSection, offset: ['start start', 'end start'] }
            );
          }
        } catch(e) {}

        // Number counter animation for stats
        try {
          var statHeadings = document.querySelectorAll('.elementor-element-2a6a9c9 .elementor-heading-title');
          statHeadings.forEach(function(heading) {
            var text = heading.textContent.trim();
            var match = text.match(/(\d+)/);
            if (match && M.inView) {
              var target = parseInt(match[1]);
              M.inView(heading, function() {
                var start = 0;
                var duration = 1500;
                var startTime = null;
                function step(timestamp) {
                  if (!startTime) startTime = timestamp;
                  var progress = Math.min((timestamp - startTime) / duration, 1);
                  var eased = 1 - Math.pow(1 - progress, 3);
                  var current = Math.round(start + (target - start) * eased);
                  heading.textContent = text.replace(match[1], current);
                  if (progress < 1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
              }, { amount: 0.5 });
            }
          });
        } catch(e) {}

      }
    } catch(e) { console.warn('PL Enhance: Motion.dev error', e); }

    // ============================================================
    // 4. SMOOTH LINK NAVIGATION FIX
    // ============================================================
    try {
      // Fix internal links to use local file paths
      var currentHost = 'plumlink.co.uk';
      var linkMap = {
        '/': 'index_edebe0ec.html',
        '/about-us/': 'about-us_160f637f.html',
        '/contact-us/': 'contact-us_d782e50b.html',
        '/heating/': 'heating_2c242ae5.html',
        '/bathroom/': 'bathroom_98bd9aee.html',
        '/plumbing/': 'plumbing_49ce68ef.html',
        '/renewables/': 'renewables_82a60079.html',
        '/showroom/': 'showroom_f7d7cc4a.html',
        '/meet-the-team/': 'meet-the-team_9efecd40.html',
        '/blog/': 'blog_b751c2dd.html',
        '/what-our-branches-look-like/': 'what-our-branches-look-like_e922f434.html'
      };

      document.querySelectorAll('a[href]').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href) {
          // Match https://plumlink.co.uk/path/ format
          var match = href.match(/https?:\/\/plumlink\.co\.uk(\/[^?#]*)/);
          if (match) {
            var path = match[1];
            if (linkMap[path]) {
              link.setAttribute('href', linkMap[path]);
            }
          }
        }
      });
    } catch(e) { console.warn('PL Enhance: link fix error', e); }

    // ============================================================
    // 5. FLOATING CTA ENHANCEMENT
    // ============================================================
    try {
      var fixedBtn = document.querySelector('.elementor-element-14712b1 .elementor-button');
      if (fixedBtn) {
        fixedBtn.style.cssText += 'animation: plPulse 2.5s infinite !important; border-radius: 50px !important;';
      }
    } catch(e) {}

    // ============================================================
    // 6. LAZY-LOAD PERFORMANCE BOOST — force lazy images visible
    // ============================================================
    try {
      var lazyContainers = document.querySelectorAll('.e-con.e-parent:not(.e-lazyloaded)');
      var lazyObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('e-lazyloaded');
            lazyObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px' });
      lazyContainers.forEach(function(c) { lazyObserver.observe(c); });
    } catch(e) {}

  }); // end onReady
})();

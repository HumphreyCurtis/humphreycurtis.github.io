(() => {
  const demoWraps = [...document.querySelectorAll('.demo-video-wrap')];
  if (!demoWraps.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setDemoState = (wrap, state) => {
    const button = wrap.querySelector('.demo-replay');
    wrap.classList.toggle('playing', state === 'playing');
    wrap.classList.toggle('ended', state === 'ended');
    button.setAttribute('aria-label', state === 'playing' ? 'Pause video' : state === 'ended' ? 'Replay video' : 'Play video');
  };

  const pauseOtherDemos = currentWrap => {
    demoWraps.forEach(wrap => {
      if (wrap === currentWrap) return;
      const video = wrap.querySelector('video');
      if (!video.paused) video.pause();
    });
  };

  const playDemo = wrap => {
    const video = wrap.querySelector('video');
    pauseOtherDemos(wrap);
    video.play().catch(() => setDemoState(wrap, 'paused'));
  };

  demoWraps.forEach(wrap => {
    const video = wrap.querySelector('video');
    const button = wrap.querySelector('.demo-replay');

    // Set both properties before observer-triggered playback for Safari.
    video.defaultMuted = true;
    video.muted = true;

    button.addEventListener('click', () => {
      if (!video.paused) video.pause();
      else {
        if (video.ended) video.currentTime = 0;
        playDemo(wrap);
      }
    });

    video.addEventListener('play', () => setDemoState(wrap, 'playing'));
    video.addEventListener('pause', () => {
      if (!video.ended) setDemoState(wrap, 'paused');
    });
    video.addEventListener('ended', () => setDemoState(wrap, 'ended'));
  });

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const visibility = new Map(demoWraps.map(wrap => [wrap, 0]));
    let previousScrollY = window.scrollY;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibility.set(entry.target, entry.intersectionRatio));

      const scrollingDown = window.scrollY >= previousScrollY;
      previousScrollY = window.scrollY;

      const primaryWrap = demoWraps
        .filter(wrap => visibility.get(wrap) >= 0.35 && !wrap.querySelector('video').ended)
        .sort((a, b) => {
          const aTop = a.getBoundingClientRect().top;
          const bTop = b.getBoundingClientRect().top;
          return scrollingDown ? bTop - aTop : aTop - bTop;
        })[0];

      if (primaryWrap) {
        const primaryVideo = primaryWrap.querySelector('video');
        if (primaryVideo.paused) playDemo(primaryWrap);
      }

      demoWraps.forEach(wrap => {
        if (wrap === primaryWrap || visibility.get(wrap) >= 0.2) return;
        const video = wrap.querySelector('video');
        if (!video.paused) video.pause();
      });
    }, { threshold: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1] });

    demoWraps.forEach(wrap => observer.observe(wrap));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) demoWraps.forEach(wrap => wrap.querySelector('video').pause());
  });
})();

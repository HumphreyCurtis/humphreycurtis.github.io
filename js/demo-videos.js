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

    // Keep autoplay eligible in Safari as well as Chromium. The HTML attribute
    // is not always reflected early enough when playback begins off a poster.
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
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && !video.ended) playDemo(entry.target);
        else if (entry.intersectionRatio < 0.35 && !video.paused) video.pause();
      });
    }, { threshold: [0, 0.35, 0.6, 1] });

    demoWraps.forEach(wrap => observer.observe(wrap));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) demoWraps.forEach(wrap => wrap.querySelector('video').pause());
  });
})();

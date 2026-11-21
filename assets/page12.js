(() => {
  const scene = document.querySelector('#overflow-wrapper');
  const run = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scene.querySelector('.bambi-run').animate([
      { transform: 'translate(-60%, 4%)' },
      { transform: 'translate(0, 0)' }
    ], { duration: 4900, easing: 'ease-out', fill: 'both' });
    scene.querySelector('.gobo-run').animate([
      { transform: 'translate(-79%, -20%)', offset: 0 },
      { transform: 'translate(-11%, -10%)', offset: 0.79 },
      { transform: 'translate(0, 0)', offset: 1 }
    ], { duration: 5600, fill: 'both' });
    const stride = [
      { translate: '0 0', rotate: '-2deg' },
      { translate: '0 -6%', rotate: '1deg' },
      { translate: '0 0', rotate: '-2deg' }
    ];
    scene.querySelector('.bambi').animate(stride, { duration: 440, iterations: 11 });
    const gobo = scene.querySelector('.gobo');
    gobo.animate(stride, { duration: 410, iterations: 11 });
    gobo.animate([
      { transform: 'rotate(180deg)', offset: 0 },
      { transform: 'rotate(180deg)', offset: 0.8 },
      { transform: 'rotate(95deg)', offset: 0.91 },
      { transform: 'rotate(0deg)', offset: 1 }
    ], { duration: 5600, fill: 'both' });
    scene.querySelector('.blood-drops').animate([{ opacity: 0 }, { opacity: 1 }],
      { delay: 5050, duration: 520, fill: 'both' });
    scene.querySelector('.blood').animate([
      { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      { opacity: 1, clipPath: 'inset(0 0 0 0)' }
    ], { delay: 2750, duration: 1550, fill: 'both' });
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
})();

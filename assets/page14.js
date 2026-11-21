(() => {
  function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scene = document.getElementById('overflow-wrapper');
    scene.querySelector('.adult').animate([
      { transform: 'scale(4.8)', offset: 0 },
      { transform: 'scale(4.8)', offset: 0.15 },
      { transform: 'scale(1)', offset: 1 }
    ], { duration: 4600, fill: 'both', easing: 'ease-in-out' });
    for (const [side, sign, delay] of [['left', -1, 4600], ['right', 1, 5100]]) {
      scene.querySelector(`.${side}-fawn`).animate([
        { translate: `${sign * 45}% 0` }, { translate: '0 0' }
      ], { duration: 2200, delay, easing: 'ease-out', fill: 'both' });
      scene.querySelector(`.${side}-head`).animate([
        { rotate: '0deg' }, { rotate: `${sign * 6}deg` }, { rotate: '0deg' }
      ], { duration: 2700, delay, iterations: Infinity, easing: 'ease-in-out' });
      scene.querySelector(`.ear-${side}`).animate([
        { rotate: '0deg' }, { rotate: `${sign * 8}deg`, offset: 0.18 },
        { rotate: '0deg', offset: 0.36 }, { rotate: '0deg' }
      ], { duration: 3100, delay: delay + 600, iterations: Infinity, easing: 'ease-in-out' });
    }
  }
  if (document.readyState === 'complete') play();
  else window.addEventListener('load', play, { once: true });
})();

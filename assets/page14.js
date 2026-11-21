(() => {
  function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scene = document.getElementById('overflow-wrapper');
    const landscape = document.createElement('div');
    landscape.className = 'layers landscape';
    landscape.append(...scene.children);
    scene.append(landscape);
    landscape.animate([
      { transform: 'scale(4.8)', offset: 0 },
      { transform: 'scale(4.8)', offset: 0.15 },
      { transform: 'scale(1)', offset: 1 }
    ], { duration: 4600, fill: 'both', easing: 'ease-in-out' });
    for (const [side, sign, delay] of [['left', -1, 4600], ['right', 1, 5100]]) {
      const fawn = scene.querySelector(`.${side}-fawn`);
      const entryX = side === 'right' ? -4 : sign * 5;
      const entryY = side === 'right' ? 10 : -19;
      const duration = 2100;
      const stride = 350;
      fawn.animate([
        { transform: `translate(${entryX}%, ${entryY}%) scale(.58)`, opacity: 0 },
        { opacity: 1, offset: .14 },
        { transform: `translate(${entryX / 2}%, ${entryY / 2}%) scale(.78)`, offset: .5 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ], { duration, delay, fill: 'both' });
      fawn.animate([
        { translate: '0 0' }, { translate: '0 -0.85%', offset: .45 }, { translate: '0 0' }
      ], { duration: stride, iterations: 6, delay, easing: 'ease-in-out' });
      for (const [index, leg] of ['one', 'two', 'three', 'four'].entries()) {
        const swing = [17, -14, -19, 16][index] * sign;
        fawn.querySelector(`.${side}-leg-${leg}`).animate([
          { rotate: '0deg' }, { rotate: `${swing}deg` },
          { rotate: `${-swing}deg` }, { rotate: '0deg' }
        ], { duration: stride, delay, iterations: 6, easing: 'ease-in-out' });
      }
      scene.querySelector(`.${side}-head`).animate([
        { rotate: '0deg' }, { rotate: `${sign * 4}deg` }, { rotate: '0deg' }
      ], { duration: 2700, delay, iterations: Infinity, easing: 'ease-in-out' });
      scene.querySelector(`.ear-${side}`).animate([
        { rotate: '0deg' }, { rotate: `${sign * 4}deg`, offset: 0.18 },
        { rotate: '0deg', offset: 0.36 }, { rotate: '0deg' }
      ], { duration: 3100, delay: delay + 600, iterations: Infinity, easing: 'ease-in-out' });
    }
  }
  if (document.readyState === 'complete') play();
  else window.addEventListener('load', play, { once: true });
})();

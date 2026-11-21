(() => {
  function play() {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = document.getElementById('overflow-wrapper');
    if (!still) for (const [selector, duration, direction] of [['.fox-group', 480, 1], ['.dog-group', 360, -1]]) {
      scene.querySelector(selector).animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${direction * 0.18}%, -0.15%)` },
        { transform: 'translate(-0.07%, 0.09%)' },
        { transform: 'translate(0, 0)' }
      ], { duration, iterations: Infinity, easing: 'ease-in-out' });
    }
    if (!still) scene.querySelector('.jaw').animate([
      { rotate: '0deg' }, { rotate: '-10deg' }, { rotate: '0deg' },
      { rotate: '-7deg' }, { rotate: '0deg', offset: 0.72 }, { rotate: '0deg' }
    ], { duration: 1200, iterations: Infinity, easing: 'ease-in-out' });
    function tears(side, eyeX, eyeY, width, height, crops) {
      const original = scene.querySelector('.tears-' + side);
      crops.forEach(([left, top, right, bottom], index) => {
        const layer = document.createElement('div');
        layer.className = 'layers';
        const drop = original.cloneNode();
        const originX = (left + right) / 2;
        const originY = (top + bottom) / 2;
        drop.style.left = (eyeX - originX * 0.5625) / 10.8 + '%';
        drop.style.top = (eyeY - originY * 0.5625) / 10.8 + '%';
        drop.style.clipPath = `inset(${100*top/height}% ${100*(width-right)/width}% ${100*(height-bottom)/height}% ${100*left/width}%)`;
        drop.style.transformOrigin = `${100*originX/width}% ${100*originY/height}%`;
        layer.append(drop);
        original.before(layer);
        const dx = (side === 'left' ? -1 : 1) * (6 + index * 2);
        const dy = 4 + index * 2;
        if (still) {
          layer.style.translate = `${dx*(index+1)/4}% ${dy*(index+1)/4}%`;
          drop.style.scale = '.65';
          return;
        }
        const timing = { duration: 2300, delay: index * 690, iterations: Infinity, fill: 'both' };
        layer.animate([{ translate: '0 0' }, { translate: `${dx}% ${dy}%` }], timing);
        drop.animate([{ scale: .08, opacity: 0 }, { opacity: 1, offset: .1 },
          { opacity: 1, offset: .72 }, { scale: .95, opacity: 0 }], timing);
      });
      original.remove();
    }
    tears('left', 822, 358, 682, 375, [[49,12,150,76],[12,133,108,192],[148,105,225,153]]);
    tears('right', 893, 383, 229, 221, [[119,32,221,99],[101,114,156,208],[37,12,81,90]]);

  }
  if (document.readyState === 'complete') play();
  else window.addEventListener('load', play, { once: true });
})();

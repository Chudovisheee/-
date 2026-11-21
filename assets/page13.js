(() => {
  function play() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scene = document.getElementById('overflow-wrapper');
    for (const [selector, duration, direction] of [['.fox-group', 480, 1], ['.dog-group', 360, -1]]) {
      scene.querySelector(selector).animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${direction * 0.18}%, -0.15%)` },
        { transform: 'translate(-0.07%, 0.09%)' },
        { transform: 'translate(0, 0)' }
      ], { duration, iterations: Infinity, easing: 'ease-in-out' });
    }
    scene.querySelector('.jaw').animate([
      { rotate: '0deg' }, { rotate: '-10deg' }, { rotate: '0deg' },
      { rotate: '-7deg' }, { rotate: '0deg', offset: 0.72 }, { rotate: '0deg' }
    ], { duration: 1200, iterations: Infinity, easing: 'ease-in-out' });
    scene.querySelector('.tears-left').animate([
      { opacity: 0, transform: 'translate(0, 0) scale(0.12)' },
      { opacity: 1, transform: 'translate(-1%, 2%) scale(0.42)', offset: 0.25 },
      { opacity: 1, offset: 0.7 },
      { opacity: 0, transform: 'translate(-22%, 28%) scale(1)' }
    ], { duration: 1900, iterations: Infinity, easing: 'ease-in' });
    scene.querySelector('.tears-right').animate([
      { opacity: 0, translate: '-43% -30%' }, { opacity: 1, offset: 0.25 },
      { opacity: 1, offset: 0.7 }, { opacity: 0, translate: '12% 21%' }
    ], { duration: 2100, delay: 650, iterations: Infinity, fill: 'both', easing: 'ease-in' });
  }
  if (document.readyState === 'complete') play();
  else window.addEventListener('load', play, { once: true });
})();

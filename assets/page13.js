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
    for (const [selector, start, end, delay] of [
      ['.tears-left', '23% -15%', '-7% 16%', 0],
      ['.tears-right', '-43% -30%', '12% 21%', 650]
    ]) {
      scene.querySelector(selector).animate([
        { opacity: 0, translate: start }, { opacity: 1, offset: 0.25 },
        { opacity: 1, offset: 0.7 }, { opacity: 0, translate: end }
      ], { duration: 2100, delay, iterations: Infinity, fill: 'both', easing: 'ease-in' });
    }
  }
  if (document.readyState === 'complete') play();
  else window.addEventListener('load', play, { once: true });
})();

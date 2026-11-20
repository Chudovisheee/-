(() => {
  function place(element, x, y, width, height, size = 1080) {
    element.style.left = `${x / size * 100}%`;
    element.style.top = `${y / size * 100}%`;
    element.style.width = `${width / size * 100}%`;
    element.style.height = `${height / size * 100}%`;
    return element;
  }

  function sprite(board, parent, name, x, y, width, height, classes = '', size = 1080) {
    const image = document.createElement('img');
    image.className = `scene-sprite ${classes}`;
    image.src = `${board.dataset.assets}/${name}.png`;
    image.alt = '';
    image.draggable = false;
    place(image, x, y, width, height, size);
    parent.append(image);
    return image;
  }

  function button(parent, label, classes) {
    const control = document.createElement('button');
    control.type = 'button';
    control.className = `scene-control ${classes}`;
    control.setAttribute('aria-label', label);
    parent.append(control);
    return control;
  }

  function pointer(board, event) {
    const rect = board.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * 1080 / rect.width,
      y: (event.clientY - rect.top) * 1080 / rect.height
    };
  }

  function drawBackground(board) {
    sprite(board, board, 'background', 0, 0, 1080, 1080);
  }

  function followTrail(board, status) {
    board.classList.add('scene-maze');
    const route = [
      [238, 207], [342, 200], [419, 203], [483, 230], [550, 264],
      [637, 307], [702, 341], [748, 377], [786, 424], [805, 477],
      [811, 530], [797, 579], [765, 614], [719, 634], [665, 633],
      [610, 613], [567, 579], [524, 551], [481, 512], [432, 474],
      [376, 455], [333, 463], [308, 492], [303, 531], [319, 567],
      [359, 594], [407, 616], [454, 627], [508, 649], [550, 685],
      [575, 720], [614, 749], [659, 772], [727, 801], [802, 854]
    ];
    const faline = sprite(board, board, 'faline', 737, 791, 249, 248);
    const walker = button(board, 'Бемби. Веди его по тропинке', 'scene-walker');
    const legs = [
      ['hind-far', 4, 162, 54, 125, true], ['front-far', 145, 175, 54, 111, false],
      ['hind-near', 0, 158, 54, 128, false], ['front-near', 124, 167, 42, 119, true]
    ];
    legs.slice(0, 2).forEach(addLeg);
    sprite(board, walker, 'bambi', 0, 58, 247, 191, '', 294);
    legs.slice(2).forEach(addLeg);

    function addLeg([name, x, y, width, height, reverse]) {
      sprite(board, walker, name, x, y + 40, width, height,
        reverse ? 'scene-leg scene-leg-reverse' : 'scene-leg', 294);
    }

    let progress = 0;
    let active = null;
    let offset = { x: 0, y: 0 };
    let timer;

    function pointAt(value) {
      const index = Math.min(Math.floor(value), route.length - 2);
      const [x, y] = route[index];
      const [nextX, nextY] = route[index + 1];
      return [x + (nextX - x) * (value - index), y + (nextY - y) * (value - index)];
    }

    function position(value) {
      const [x, y] = pointAt(value);
      walker.style.transform = `scale(${1 - 0.42 * value / (route.length - 1)})`;
      place(walker, x - 148, y - 228, 294, 294);
    }

    function advance(value) {
      progress = value;
      position(progress);
      walker.classList.add('is-walking');
      clearTimeout(timer);
      timer = setTimeout(() => walker.classList.remove('is-walking'), 260);
      if (progress >= route.length - 1) {
        status.textContent = 'Бемби добрался до Фалины!';
        faline.classList.add('scene-fed');
      }
    }

    position(0);
    walker.addEventListener('pointerdown', event => {
      if (active !== null || !event.isPrimary || event.button !== 0 || progress >= route.length - 1) return;
      const start = pointer(board, event);
      const [x, y] = pointAt(progress);
      offset = { x: x - start.x, y: y - start.y };
      active = event.pointerId;
      walker.setPointerCapture(active);
      status.textContent = 'Веди Бемби по розовой тропинке к Фалине.';
    });

    walker.addEventListener('pointermove', event => {
      if (event.pointerId !== active || progress >= route.length - 1) return;
      const point = pointer(board, event);
      point.x += offset.x;
      point.y += offset.y;
      let closest = Infinity;
      let best = progress;
      const limit = Math.min(Math.floor(progress) + 2, route.length - 2);

      for (let index = Math.floor(progress); index <= limit; index++) {
        const [x, y] = route[index];
        const dx = route[index + 1][0] - x;
        const dy = route[index + 1][1] - y;
        const projection = ((point.x - x) * dx + (point.y - y) * dy) / (dx * dx + dy * dy);
        const fraction = Math.min(1, Math.max(0, progress - index, projection));
        const distance = Math.hypot(point.x - x - fraction * dx, point.y - y - fraction * dy);
        if (distance < closest) {
          closest = distance;
          best = index + fraction;
        }
      }

      if (closest > 45) {
        status.textContent = 'Вернись к месту, где остановился Бемби, и продолжай по розовой тропинке.';
      } else if (best > progress + 0.01) {
        status.textContent = 'Веди Бемби по розовой тропинке к Фалине.';
        const finish = route.length - 1;
        advance(best > finish - 0.1 ? finish : best);
      }
    });

    walker.addEventListener('lostpointercapture', () => {
      active = null;
      walker.classList.remove('is-walking');
    });

    walker.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight') return;
      event.preventDefault();
      if (progress < route.length - 1) advance(Math.min(progress + 1, route.length - 1));
    });
  }

  const board = document.querySelector('[data-bambi-scene="10"]');
  drawBackground(board);
  followTrail(board, board.parentElement.querySelector('.scene-status'));
})();

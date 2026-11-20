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

    let [x, y] = route[0];
    let drag = null;
    let ended = false;
    let stepTimer;

    function draw() {
      const size = 294 * (1 - 0.36 * Math.max(0, y - 207) / 873);
      place(walker, x - size * 0.5, y - size * 0.77, size, size);
    }

    function nearTrail() {
      return route.slice(1).some(([bx, by], i) => {
        const [ax, ay] = route[i];
        const dx = bx - ax;
        const dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(x - ax - t * dx, y - ay - t * dy) < 86;
      });
    }

    function move(nextX, nextY) {
      if (ended) return;
      x = Math.max(30, Math.min(1050, nextX));
      y = Math.max(60, Math.min(1045, nextY));
      draw();
      walker.classList.add('is-walking');
      clearTimeout(stepTimer);
      stepTimer = setTimeout(() => walker.classList.remove('is-walking'), 180);
      const hunter = Math.hypot((x - 229) / 128, (y - 905) / 141);
      const falineDistance = Math.hypot((x - 853) / 120, (y - 905) / 117);
      if (hunter <= 1 || falineDistance <= 1) {
        ended = true;
        if (hunter <= 1) finish('Охотник заметил Бемби', 'В другой раз попробуй розовую тропинку к Фалине.');
        else {
          faline.classList.add('scene-fed');
          finish('Бемби нашёл Фалину!', 'Ты помог Бемби добраться до Фалины.');
        }
        return;
      }
      const warning = hunter < 1.8 ? 'Осторожно, впереди охотник!'
        : nearTrail() ? '' : 'Бемби сошёл с розовой тропинки.';
      if (status.textContent !== warning) status.textContent = warning;
    }

    draw();
    walker.addEventListener('pointerdown', event => {
      if (ended || drag || !event.isPrimary || event.button !== 0) return;
      const point = pointer(board, event);
      drag = { id: event.pointerId, dx: x - point.x, dy: y - point.y };
      walker.setPointerCapture(event.pointerId);
    });
    walker.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      const point = pointer(board, event);
      move(point.x + drag.dx, point.y + drag.dy);
    });
    walker.addEventListener('lostpointercapture', () => {
      drag = null;
      walker.classList.remove('is-walking');
    });
    const directions = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
    walker.addEventListener('keydown', event => {
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      move(x + direction[0], y + direction[1]);
    });
  }


  let board = document.querySelector('[data-bambi-scene]');
  const overlay = document.getElementById('game_overlay');
  const play = overlay.querySelector('button');
  const status = board.parentElement.querySelector('.scene-status');

  function finish(title, message) {
    board.inert = true;
    status.textContent = '';
    overlay.querySelector('h2').textContent = title;
    overlay.querySelector('.game-card__text').textContent = message;
    overlay.querySelector('.game-card__hint').hidden = true;
    play.textContent = 'Играть ещё';
    overlay.hidden = false;
    play.focus();
  }

  play.addEventListener('click', () => {
    const fresh = board.cloneNode(false);
    board.replaceWith(fresh);
    board = fresh;
    board.inert = false;
    overlay.hidden = true;
    status.textContent = '';
    drawBackground(board);
    followTrail(board, status);
    board.querySelector('.scene-walker').focus({ preventScroll: true });
  });
})();

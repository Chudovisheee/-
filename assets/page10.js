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
      [238, 207], [342, 200], [419, 203], [483, 230], [550, 264], [592, 286],
      [637, 307], [702, 341], [748, 377], [786, 424], [805, 477], [811, 520],
      [811, 530], [797, 579], [765, 614], [719, 634], [665, 633],
      [610, 613], [567, 579], [534, 557], [524, 551], [481, 512], [432, 474],
      [376, 455], [333, 463], [308, 492], [303, 531], [319, 567],
      [359, 594], [407, 616], [454, 627], [477, 638], [508, 649], [550, 685],
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

    const greenTrail = [
      route[0], [386, 272], [473, 326], [539, 406], [580, 443], [627, 478],
      [745, 518], [811, 520], [843, 522], [916, 460], [944, 365], [919, 293],
      [850, 235], [744, 214], [651, 238], [592, 286], [579, 379], [580, 443],
      [584, 490], [551, 530], [534, 557], [500, 574], [477, 638], [465, 672], [435, 728],
      [390, 784], [313, 837], [229, 905]
    ];

    const junctions = new Map();
    function nodeAt([px, py]) {
      const key = px + ',' + py;
      if (!junctions.has(key)) junctions.set(key, { x: px, y: py, edges: [] });
      return junctions.get(key);
    }

    function connect(points, danger) {
      let first;
      for (let i = 1; i < points.length; i++) {
        const a = nodeAt(points[i - 1]);
        const b = nodeAt(points[i]);
        const edge = { a, b, danger };
        a.edges.push(edge);
        b.edges.push(edge);
        if (!first) first = edge;
      }
      return first;
    }

    let current = connect(route, false);
    connect(greenTrail, true);
    const safeEnd = nodeAt(route[route.length - 1]);
    const dangerEnd = nodeAt(greenTrail[greenTrail.length - 1]);

    function move(nextX, nextY) {
      if (ended) return;
      const candidates = new Set([current]);
      for (const node of [current.a, current.b]) {
        if (Math.hypot(x - node.x, y - node.y) < 30) {
          for (const edge of node.edges) candidates.add(edge);
        }
      }
      let bestDistance = 72;
      let selected;
      for (const edge of candidates) {
        const dx = edge.b.x - edge.a.x;
        const dy = edge.b.y - edge.a.y;
        const t = Math.max(0, Math.min(1, ((nextX - edge.a.x) * dx + (nextY - edge.a.y) * dy) / (dx * dx + dy * dy)));
        const px = edge.a.x + dx * t;
        const py = edge.a.y + dy * t;
        const distance = Math.hypot(nextX - px, nextY - py);
        if (distance < bestDistance) {
          bestDistance = distance;
          selected = { edge, px, py };
        }
      }
      if (!selected || Math.hypot(selected.px - x, selected.py - y) < 0.1) return;
      current = selected.edge;
      x = selected.px;
      y = selected.py;
      draw();
      walker.classList.add('is-walking');
      clearTimeout(stepTimer);
      stepTimer = setTimeout(() => walker.classList.remove('is-walking'), 180);
      const atHunter = current.b === dangerEnd && Math.hypot(x - dangerEnd.x, y - dangerEnd.y) < 24;
      const atFaline = current.b === safeEnd && Math.hypot(x - safeEnd.x, y - safeEnd.y) < 24;
      if (atHunter || atFaline) {
        ended = true;
        if (atHunter) finish('Охотник заметил Бемби', 'На развилке можно повернуть обратно и поискать Фалину.');
        else {
          faline.classList.add('scene-fed');
          finish('Бемби нашёл Фалину!', 'Ты помог Бемби добраться до Фалины.');
        }
        return;
      }
      const warning = current.danger ? 'Осторожно! Бемби может попасться охотнику.' : '';
      if (status.textContent !== warning) status.textContent = warning;
    }

    draw();
    walker.addEventListener('pointerdown', event => {
      if (ended || drag || !event.isPrimary || event.button !== 0) return;
      const point = pointer(board, event);
      drag = { id: event.pointerId, start: point, last: { x, y }, dx: x - point.x, dy: y - point.y };
      walker.setPointerCapture(event.pointerId);
    });
    walker.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      const point = pointer(board, event);
      const grip = Math.max(0, 1 - Math.hypot(point.x - drag.start.x, point.y - drag.start.y) / 90);
      const target = { x: point.x + drag.dx * grip, y: point.y + drag.dy * grip };
      const dx = target.x - drag.last.x;
      const dy = target.y - drag.last.y;
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 12));
      for (let i = 1; i <= steps; i++) {
        move(drag.last.x + dx * i / steps, drag.last.y + dy * i / steps);
      }
      drag.last = target;
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

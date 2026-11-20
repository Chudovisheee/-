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
    const walker = document.createElement('div');
    walker.className = 'scene-walker';
    walker.style.position = 'absolute';
    board.append(walker);
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

    const stops = [4, 10, 16, 22, 28, 34];
    const greenNotes = [[412, 289], [937, 386], [686, 508], [501, 569], [442, 719], [396, 777]];
    const pink = button(board, 'Розовая нота', 'trail-note pink-note');
    const green = button(board, 'Зелёная нота', 'trail-note green-note');
    pink.textContent = '♫';
    green.textContent = '♪';
    let stage = 0;
    let mistakes = 0;

    function showNotes() {
      for (const [note, [x, y]] of [[pink, route[stops[stage]]], [green, greenNotes[stage]]]) {
        note.style.left = `${x / 10.8}%`;
        note.style.top = `${y / 10.8}%`;
        note.hidden = false;
      }
      pink.focus({ preventScroll: true });
    }

    pink.addEventListener('click', () => {
      pink.hidden = green.hidden = true;
      status.textContent = '';
      const start = progress;
      const end = stops[stage];
      const began = performance.now();
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1000;
      walker.classList.add('is-walking');
      function step(now) {
        const fraction = Math.min(1, (now - began) / duration);
        position(start + (end - start) * fraction);
        if (fraction < 1) {
          requestAnimationFrame(step);
          return;
        }
        progress = end;
        stage++;
        walker.classList.remove('is-walking');
        if (stage === stops.length) {
          faline.classList.add('scene-fed');
          finish('Бемби нашёл Фалину!', 'Ты провёл Бемби по розовой тропинке.');
        } else {
          showNotes();
        }
      }
      requestAnimationFrame(step);
    });

    green.addEventListener('click', event => {
      if (event.detail > 1) return;
      mistakes++;
      if (mistakes === 2) {
        finish('Охотник заметил Бемби', 'Зелёные ноты ведут к охотнику. Попробуй ещё раз.');
      } else {
        status.textContent = 'Отсюда слышен охотник! Выбери розовую ноту.';
      }
    });
    position(0);
    showNotes();
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
  });
})();

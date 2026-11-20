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

  function animateDeer(board) {
    const leaves = [
      ['leaf-4', 232, 50, 23, 45], ['leaf-3', 277, 59, 42, 30],
      ['leaf-7', 348, 121, 45, 50], ['leaf-1', 260, 168, 37, 78],
      ['leaf-9', 333, 207, 55, 36], ['leaf-2', 36, 289, 36, 30],
      ['leaf-4', 104, 289, 20, 41], ['leaf-2', 650, 46, 50, 45],
      ['leaf-3', 660, 125, 63, 38], ['leaf-9', 766, 75, 35, 65],
      ['leaf-4', 993, 250, 24, 46], ['leaf-2', 993, 322, 38, 34],
      ['leaf-8', 1039, 284, 35, 24]
    ];
    leaves.forEach(([name, ...position], index) => {
      const leaf = sprite(board, board, name, ...position, 'scene-leaf');
      leaf.style.animationDelay = `${index * 85}ms`;
    });
    sprite(board, board, 'faline', 95, 406, 445, 674);
    sprite(board, board, 'bambi', 513, 193, 519, 887);
    sprite(board, board, 'faline-eye', 330, 501, 18, 21, 'scene-eye-idle');
    sprite(board, board, 'bambi-eye', 741, 470, 24, 33, 'scene-eye-idle');
    sprite(board, board, 'heart', 469, 348, 104, 113, 'scene-heart');
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

  function feedGobo(board, status) {
    const inset = document.createElement('img');
    inset.className = 'scene-sprite';
    inset.src = `${board.dataset.assets}/gobo-and-the-man.svg`;
    inset.alt = '';
    place(inset, 354, 0, 726, 749);
    board.append(inset);

    sprite(board, board, 'bambi', 316, 782, 178, 169);
    sprite(board, board, 'faline', 242, 805, 170, 152);
    sprite(board, board, 'gobo', 634, 809, 149, 154);

    const smallEyes = [[662, 865, 4.5, 5], [670, 866, 4.5, 5]];
    const largeEyes = [[731, 349, 12, 15], [781, 352, 12, 15]];
    const eyes = [...smallEyes, ...largeEyes].map(([x, y, width, height]) => ({
      image: sprite(board, board, 'gobo-right-eye', x, y, width, height, 'scene-eye'),
      x: x + width / 2,
      y: y + height / 2
    }));
    const target = place(button(board, 'Покормить Гобо', 'scene-gobo'), 626, 811, 152, 149);
    const upperTarget = place(button(board, 'Покормить Гобо на большой картинке', 'scene-gobo'), 699, 282, 128, 177);
    upperTarget.tabIndex = -1;
    const food = [
      ['cupcake-1', 947, 162], ['cupcake-2', 391, 595],
      ['cupcake-3', 982, 894], ['cupcake-4', 117, 963], ['cupcake-5', 219, 961],
      ['leaf-1', 632, 379], ['leaf-2', 101, 822], ['leaf-3', 342, 964],
      ['leaf-4', 623, 963], ['leaf-5', 705, 963], ['leaf-6', 788, 963]
    ];
    let selected = null;
    let drag = null;
    let fed = 0;

    function look(event) {
      const point = pointer(board, event);
      for (const { image, x, y } of eyes) {
        const dx = point.x - x;
        const dy = point.y - y;
        const distance = Math.max(36, Math.hypot(dx, dy));
        image.style.setProperty('--look-x', `${dx / distance * 30}%`);
        image.style.setProperty('--look-y', `${dy / distance * 23}%`);
      }
    }

    function select(item) {
      if (selected) {
        selected.classList.remove('is-selected');
        selected.setAttribute('aria-pressed', 'false');
      }
      selected = item;
      selected.classList.add('is-selected');
      selected.setAttribute('aria-pressed', 'true');
      status.textContent = 'Теперь коснись Гобо, чтобы угостить его.';
    }

    function feed() {
      if (!selected) return;
      const hadFocus = document.activeElement === selected || document.activeElement === target;
      selected.hidden = true;
      selected = null;
      fed++;
      const nextFood = board.querySelector('.scene-food:not([hidden])');
      if (hadFocus) (nextFood || target).focus();
      status.textContent = fed === food.length
        ? 'Все угощения найдены. Гобо сыт!'
        : `Гобо съел угощение. Найдено ${fed} из ${food.length}.`;
    }

    food.forEach(([name, x, y]) => {
      const isLeaf = name.startsWith('leaf');
      const width = isLeaf ? 72 : 73;
      const height = isLeaf ? 106 : 92;
      const item = place(button(board, isLeaf ? 'Листик' : 'Кекс', 'scene-food'), x, y, width, height);
      sprite(board, item, name, 0, 0, 100, 100, '', 100);
      item.setAttribute('aria-pressed', 'false');
      item.addEventListener('click', () => { if (!item.hidden) select(item); });

      item.addEventListener('pointerdown', event => {
        if (drag || !event.isPrimary || event.button !== 0) return;
        drag = { item, id: event.pointerId, start: pointer(board, event), ghost: null };
        item.setPointerCapture(drag.id);
      });

      item.addEventListener('pointermove', event => {
        if (drag?.item !== item || drag.id !== event.pointerId) return;
        const point = pointer(board, event);
        if (!drag.ghost && Math.hypot(point.x - drag.start.x, point.y - drag.start.y) < 12) return;
        if (!drag.ghost) {
          select(item);
          drag.ghost = sprite(board, board, name, 0, 0, width, height, 'scene-food-ghost');
        }
        place(drag.ghost, point.x - width / 2, point.y - height / 2, width, height);
      });

      item.addEventListener('pointerup', event => {
        if (drag?.item !== item || drag.id !== event.pointerId || !drag.ghost) return;
        const hit = document.elementFromPoint(event.clientX, event.clientY);
        if (hit === target || hit === upperTarget) feed();
      });

      item.addEventListener('lostpointercapture', () => {
        if (drag?.item !== item) return;
        drag.ghost?.remove();
        drag = null;
      });
    });

    board.addEventListener('pointermove', look);
    board.addEventListener('pointerdown', look);
    target.addEventListener('click', feed);
    upperTarget.addEventListener('click', feed);
  }

  const scenes = { 9: animateDeer, 10: followTrail, 11: feedGobo };
  document.querySelectorAll('[data-bambi-scene]').forEach(board => {
    drawBackground(board);
    const status = board.parentElement.querySelector('.scene-status');
    scenes[board.dataset.bambiScene](board, status);
  });
})();

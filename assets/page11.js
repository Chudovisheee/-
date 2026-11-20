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

  const board = document.querySelector('[data-bambi-scene="11"]');
  drawBackground(board);
  feedGobo(board, board.parentElement.querySelector('.scene-status'));
})();

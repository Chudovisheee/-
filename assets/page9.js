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

  const board = document.querySelector('[data-bambi-scene="9"]');
  board.replaceChildren();
  drawBackground(board);
  animateDeer(board);
})();

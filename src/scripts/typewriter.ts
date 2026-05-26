function initTypewriter() {
  const wrap    = document.getElementById('matrix-wrap');
  const text    = document.getElementById('matrix-text');
  const cursor  = document.getElementById('matrix-cursor');
  const comment = document.getElementById('matrix-comment');
  if (!wrap || !text || !cursor || !comment) return;

  const QUOTE = wrap.dataset.quote ?? '';
  comment.textContent = wrap.dataset.comment ?? '';
  let i = 0, timer: ReturnType<typeof setTimeout>;

  const blink = setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
  }, 530);

  function type() {
    if (i < QUOTE.length) {
      text.textContent = QUOTE.slice(0, ++i);
      timer = setTimeout(type, 35 + Math.random() * 25);
    } else {
      timer = setTimeout(() => {
        comment.style.opacity = '1';
        timer = setTimeout(erase, 5000);
      }, 3000);
    }
  }

  function erase() {
    comment.style.opacity = '0';
    timer = setTimeout(function del() {
      if (i > 0) {
        text.textContent = QUOTE.slice(0, --i);
        timer = setTimeout(del, 18 + Math.random() * 12);
      } else {
        timer = setTimeout(type, 1200);
      }
    }, 500);
  }

  type();

  document.addEventListener('astro:before-preparation',
    () => { clearTimeout(timer); clearInterval(blink); },
    { once: true }
  );
}

document.addEventListener('astro:page-load', initTypewriter);

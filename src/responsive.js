// Observe a container's size and call redraw({width, height}) on change (debounced).
// Also fires once immediately with the current size. If the container is currently
// 0x0 (e.g. inside an inactive tab panel), the first non-zero measurement from the
// ResizeObserver will trigger redraw — so this works for lazy-revealed panels too.
export function observeSize(selector, redraw, debounceMs = 150) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return () => {};

  const measure = () => ({ width: el.clientWidth, height: el.clientHeight });

  const initial = measure();
  if (initial.width > 0 && initial.height > 0) {
    redraw(initial);
  }

  let timer;
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const dims = measure();
      if (dims.width > 0 && dims.height > 0) redraw(dims);
    }, debounceMs);
  });
  ro.observe(el);

  return () => { clearTimeout(timer); ro.disconnect(); };
}

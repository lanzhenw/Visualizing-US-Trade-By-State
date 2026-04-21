// Tab switching with lazy init. Each tab can register an init function that runs on first reveal.
const lazyInits = new Map();

export function registerTabInit(tabKey, initFn) {
  lazyInits.set(tabKey, initFn);
}

export function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.dataset.tab;

      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tabKey).classList.add('active');

      // Lazy init on first reveal (container has proper dimensions now)
      if (lazyInits.has(tabKey)) {
        const fn = lazyInits.get(tabKey);
        lazyInits.delete(tabKey);
        // Defer one frame so layout has settled
        requestAnimationFrame(() => fn());
      }

      // Fire resize so any ResizeObserver re-measures after tab visibility change
      window.dispatchEvent(new Event('resize'));
    });
  });
}

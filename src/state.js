export const state = {
  selectedState: 'Texas',
  selectedTime: '2025',
  numberOfLabels: 5,
};

const listeners = [];

export function onStateChange(fn) {
  listeners.push(fn);
}

export function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach(fn => fn(state));
}

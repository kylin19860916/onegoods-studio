import { expandChoices } from './keyring-choices.js';

export function setupClicker() {
  const links = [...document.querySelectorAll('[data-keyring-product]')];
  const panels = [...document.querySelectorAll('[data-keyring-panel]')];
  const form = document.querySelector('#clicker-form');
  const rail = document.querySelector('#clicker-rail');
  const labels = document.querySelector('#clicker-labels');
  const template = document.querySelector('#clicker-label-template');
  const swatches = document.querySelector('#plate-swatch-options');

  const defaults = { base: '#393142', cap: '#a087c1', ink: '#fffcf5' };
  for (const name of Object.keys(defaults)) {
    const select = form.elements[name];
    select.append(swatches.content.cloneNode(true));
    select.value = defaults[name];
    expandChoices(select, { colours: true });
  }
  const { base, cap, ink } = form.elements;
  const countDisplay = document.querySelector('#clicker-count');
  const remove = document.querySelector('#clicker-remove');
  const add = document.querySelector('#clicker-add');
  let count = 2;
  const maximum = 4;
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

  const keys = Array.from({ length: 4 }, (_, index) => {
    const row = template.content.cloneNode(true).firstElementChild;
    const label = labels.dataset.keyLabel + ' ' + (index + 1);
    row.querySelector('span').textContent = label;
    labels.append(row);
    const input = row.querySelector('input');
    input.setAttribute('aria-label', label);
    function updateLetter() {
      input.value = segmenter.segment(input.value.trim())[Symbol.iterator]().next().value?.segment || '';
      render();
    }
    input.addEventListener('input', event => {
      if (!event.isComposing) updateLetter();
    });
    input.addEventListener('compositionend', updateLetter);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'clicker-key';
    button.addEventListener('click', () => {
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        button.getAnimations().forEach(animation => animation.cancel());
        button.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(5px)' }, { transform: 'translateY(0)' }], 180);
      }
    });
    rail.append(button);
    return { row, input, button, label };
  });

  function render() {
    countDisplay.value = String(count);
    remove.disabled = count === 1;
    add.disabled = count === maximum;
    labels.style.setProperty('--clicker-count', String(count));
    rail.style.setProperty('--clicker-count', String(count));
    rail.style.setProperty('--clicker-base', base.value);
    rail.style.setProperty('--clicker-cap', cap.value);
    rail.style.setProperty('--clicker-ink', ink.value);
    labels.style.setProperty('--clicker-cap', cap.value);
    labels.style.setProperty('--clicker-ink', ink.value);
    for (const [index, key] of keys.entries()) {
      const visible = index < count;
      key.row.hidden = key.button.hidden = !visible;
      const text = key.input.value.trim();
      key.row.querySelector('span').textContent = text || String(index + 1);
      key.button.textContent = text || String(index + 1);
      key.button.setAttribute('aria-label', text ? key.label + ' · ' + text : key.label);
    }
  }

  remove.addEventListener('click', () => { count = Math.max(1, count - 1); render(); });
  add.addEventListener('click', () => { count = Math.min(maximum, count + 1); render(); });

  function showProduct() {
    const selected = location.hash === '#name-clicker' ? 'name-clicker' : 'name-tag';
    for (const panel of panels) panel.hidden = panel.id !== selected;
    for (const link of links) {
      if (link.dataset.keyringProduct === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  form.addEventListener('input', event => { if (!event.isComposing) render(); });
  form.addEventListener('submit', event => event.preventDefault());
  window.addEventListener('hashchange', showProduct);
  render();
  showProduct();
}

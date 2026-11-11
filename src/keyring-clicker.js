import { expandChoices } from './keyring-choices.js';
import { keyringFonts, setupFontPicker } from './keyring-font-picker.js';
import { parseKeyringFont } from '../server/keyring-geometry.mjs';
import { createClickerViewer } from './clicker-viewer.js';

const fontCache = new Map();
function loadFont(key) {
  if (!fontCache.has(key)) {
    const pending = fetch('/assets/fonts/keyring/' + keyringFonts[key]).then(response => {
      if (!response.ok) throw new Error('Font unavailable');
      return response.arrayBuffer();
    }).then(buffer => parseKeyringFont(new Uint8Array(buffer))).catch(error => {
      fontCache.delete(key);
      throw error;
    });
    fontCache.set(key, pending);
    if (fontCache.size > 5) fontCache.delete(fontCache.keys().next().value);
  }
  return fontCache.get(key);
}

export function setupClicker() {
  const headings = document.querySelectorAll('[data-keyring-intro]');
  const panels = [...document.querySelectorAll('[data-keyring-panel]')];
  const form = document.querySelector('#clicker-form');
  const labels = document.querySelector('#clicker-labels');
  const template = document.querySelector('#clicker-label-template');
  const swatches = document.querySelector('#plate-swatch-options');
  const controls = labels.querySelector('.clicker-inline-controls');
  const status = document.querySelector('#clicker-status');
  const viewer = createClickerViewer(document.querySelector('#clicker-canvas'), document.querySelector('#clicker-view'), document.querySelector('#clicker-reset'), document.querySelector('#clicker-inspect'));
  const defaults = {
    base: '#393142', cap: '#a087c1', ink: '#fffcf5',
    nameInk: '#fffcf5', nameFill: '#efb39e', nameBorder: '#f2c879',
  };
  for (const name of Object.keys(defaults)) {
    const select = form.elements[name];
    select.append(swatches.content.cloneNode(true));
    select.value = defaults[name];
    expandChoices(select, { colours: true });
  }
  const { base, cap, ink, clickerStyle, clickerName, nameInk, nameFill, nameBorder } = form.elements;
  const basicSettings = document.querySelector('#clicker-basic-settings');
  const nameSettings = document.querySelector('#clicker-name-settings');
  const hint = document.querySelector('#clicker-hint');
  const nameFont = document.querySelector('#plate-style').cloneNode(true);
  nameFont.id = 'clicker-name-font';
  nameFont.name = 'clickerNameFont';
  nameFont.value = 'huninn';
  document.querySelector('#clicker-name-font-field').append(nameFont);
  setupFontPicker(nameFont);
  const remove = document.querySelector('#clicker-remove');
  const add = document.querySelector('#clicker-add');
  let count = 2;
  let version = 0;
  const maximum = 4;
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const keys = Array.from({ length: maximum }, (_, index) => {
    const row = template.content.cloneNode(true).firstElementChild;
    const label = labels.dataset.keyLabel + ' ' + (index + 1);
    const input = row.querySelector('input');
    input.setAttribute('aria-label', label);
    const font = document.querySelector('#plate-style').cloneNode(true);
    font.id = 'clicker-font-' + (index + 1);
    font.name = 'keyFont' + index;
    font.value = 'huninn';
    row.querySelector('.clicker-font-field').append(font);
    labels.insertBefore(row, controls);
    const fontCaption = row.querySelector('.clicker-font-field label');
    const triggerText = fontCaption.textContent;
    fontCaption.textContent = label + ' · ' + triggerText;
    setupFontPicker(font, { triggerText });
    function updateLetter() {
      input.value = segmenter.segment(input.value.trim())[Symbol.iterator]().next().value?.segment || '';
    }
    input.addEventListener('input', event => { if (!event.isComposing) updateLetter(); });
    input.addEventListener('compositionend', () => { updateLetter(); render(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.isComposing) viewer?.press(index);
    });
    return { row, input, font };
  });

  async function render() {
    const currentVersion = ++version;
    const style = clickerStyle.value;
    const wholeName = style === 'name';
    basicSettings.hidden = wholeName;
    nameSettings.hidden = !wholeName;
    hint.textContent = hint.dataset[style];
    remove.disabled = count === 1;
    add.disabled = count === maximum;
    labels.style.setProperty('--clicker-cap', cap.value);
    labels.style.setProperty('--clicker-ink', ink.value);
    for (const [name, field] of Object.entries({ base, cap, ink, nameInk, nameFill, nameBorder })) {
      const current = form.querySelector('[data-clicker-current="' + name + '"]');
      const selected = form.querySelector('input[name="' + name + '"]:checked');
      current.querySelector('i').style.backgroundColor = field.value;
      current.querySelector('span').textContent = selected.closest('label').querySelector('span').textContent;
    }
    for (const [index, key] of keys.entries()) {
      key.row.hidden = index >= count;
      key.input.style.fontFamily = '"OGS Full ' + key.font.value + '"';
    }
    if (!viewer) { status.textContent = status.dataset.noWebgl; return; }
    try {
      const sources = wholeName
        ? [{ text: clickerName.value.trim() || nameFont.selectedOptions[0].dataset.sample || clickerName.placeholder, font: nameFont.value }]
        : keys.slice(0, count).map(key => ({ text: key.input.value.trim(), font: key.font.value }));
      const entries = await Promise.all(sources.map(async entry => ({
        text: entry.text.normalize('NFC'), font: await loadFont(entry.font),
      })));
      if (currentVersion !== version) return;
      let unsupported = false;
      for (const entry of entries) {
        if ([...entry.text].some(char => char !== ' ' && !entry.font.charToGlyphIndex(char))) {
          entry.text = '';
          unsupported = true;
        }
      }
      const palette = wholeName
        ? { base: nameBorder.value, cap: nameFill.value, ink: nameInk.value }
        : { base: base.value, cap: cap.value, ink: ink.value };
      const size = viewer.update({ keys: entries, style, ...palette });
      const dimensions = document.querySelector('#clicker-dimensions');
      dimensions.textContent = dimensions.dataset.label + ' · ' + size.map(n => Number(n.toFixed(1))).join(' × ') + ' mm';
      status.textContent = unsupported ? status.dataset.unsupported : '';
    } catch {
      if (currentVersion === version) status.textContent = status.dataset.error;
    }
  }
  remove.addEventListener('click', () => { count = Math.max(1, count - 1); render(); });
  add.addEventListener('click', () => { count = Math.min(maximum, count + 1); render(); });
  function showProduct() {
    const requested = location.hash.slice(1) || new URLSearchParams(location.search).get('style');
    const selected = requested === 'name-clicker' ? 'name-clicker' : 'name-tag';
    for (const panel of panels) panel.hidden = panel.id !== selected;
    for (const heading of headings) heading.hidden = heading.dataset.keyringIntro !== selected;
  }
  form.addEventListener('input', event => { if (!event.isComposing) render(); });
  form.addEventListener('submit', event => event.preventDefault());
  window.addEventListener('hashchange', showProduct);
  render();
  showProduct();
}

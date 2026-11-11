import { exceedsClickerTextLimit } from './clicker-test-pricing.js';
import { setupClickerOrderTest } from './clicker-order-test.js';
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
  const form = document.querySelector('#clicker-form');
  const labels = document.querySelector('#clicker-labels');
  const template = document.querySelector('#clicker-label-template');
  const swatches = document.querySelector('#plate-swatch-options');
  const controls = labels.querySelector('.clicker-inline-controls');
  const status = document.querySelector('#clicker-status');
  const viewer = createClickerViewer(document.querySelector('#clicker-canvas'), document.querySelector('#clicker-view'), document.querySelector('#clicker-reset'), document.querySelector('#clicker-inspect'));
  function setupColour(select, initial) {
    const field = select.parentElement;
    const current = field.closest('details').querySelector('[data-clicker-current]');
    select.append(swatches.content.cloneNode(true));
    select.value = initial;
    expandChoices(select, { colours: true });

    const selected = () => field.querySelector('input:checked');
    return {
      get value() { return selected().value; },
      sync() {
        const radio = selected();
        current.querySelector('i').style.backgroundColor = radio.value;
        current.querySelector('span').textContent = radio.closest('label').querySelector('span').textContent;
      },
    };
  }
  const base = setupColour(form.elements.base, '#393142');
  const nameInk = setupColour(form.elements.nameInk, '#fffcf5');
  const nameFill = setupColour(form.elements.nameFill, '#efb39e');
  const nameBorder = setupColour(form.elements.nameBorder, '#f2c879');
  const { clickerStyle, clickerName } = form.elements;
  const perKeySettings = document.querySelector('#clicker-per-key-settings');
  const nameSettings = document.querySelector('#clicker-name-settings');
  const hint = document.querySelector('#clicker-hint');
  const textLimit = document.querySelector('#clicker-name-limit-error');
  const nameFont = document.querySelector('#plate-style').cloneNode(true);
  nameFont.id = 'clicker-name-font';
  nameFont.name = 'clickerNameFont';
  nameFont.value = 'huninn';
  document.querySelector('#clicker-name-font-field').append(nameFont);
  setupFontPicker(nameFont);
  const remove = document.querySelector('#clicker-remove');
  const add = document.querySelector('#clicker-add');
  const keySettings = document.querySelector('#clicker-key-settings');
  const settingsTemplate = document.querySelector('#clicker-key-settings-template');
  let count = 2;
  let activeKey = 0;
  let version = 0;
  const maximum = 4;
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const keys = Array.from({ length: maximum }, (_, index) => {
    const row = template.content.cloneNode(true).firstElementChild;
    const settings = settingsTemplate.content.cloneNode(true).firstElementChild;
    const number = index + 1;
    const label = labels.dataset.keyLabel + ' ' + number;
    const input = row.querySelector('input');
    const settingsTitle = settings.querySelector('[data-key-settings-title]');
    settings.id = 'clicker-key-settings-' + number;
    settingsTitle.id = settings.id + '-title';
    settingsTitle.textContent = settingsTitle.dataset.label + ' ' + number;
    settings.setAttribute('aria-labelledby', settingsTitle.id);
    input.setAttribute('aria-label', label);
    input.setAttribute('aria-controls', settings.id);
    row.querySelector('.clicker-slot-number').textContent = number;

    const font = document.querySelector('#plate-style').cloneNode(true);
    font.id = 'clicker-font-' + number;
    font.name = 'keyFont' + index;
    font.value = 'huninn';
    settings.querySelector('[data-key-font-field]').append(font);
    labels.insertBefore(row, controls);
    keySettings.append(settings);
    setupFontPicker(font);

    const cap = settings.querySelector('[data-key-cap]');
    const ink = settings.querySelector('[data-key-ink]');
    cap.id = cap.name = 'clicker-key-cap-' + number;
    ink.id = ink.name = 'clicker-key-ink-' + number;
    const capColour = setupColour(cap, '#a087c1');
    const inkColour = setupColour(ink, '#fffcf5');
    const selectKey = () => {
      activeKey = index;
      showKeySettings();
    };
    input.addEventListener('focus', selectKey);
    input.addEventListener('click', selectKey);
    function updateLetter() {
      input.value = segmenter.segment(input.value.trim())[Symbol.iterator]().next().value?.segment || '';
    }
    input.addEventListener('input', event => { if (!event.isComposing) updateLetter(); });
    input.addEventListener('compositionend', () => { updateLetter(); render(); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.isComposing) viewer?.press(index);
    });
    return { row, input, font, settings, cap: capColour, ink: inkColour };
  });

  function showKeySettings() {
    for (const [index, key] of keys.entries()) {
      key.row.hidden = index >= count;
      key.row.classList.toggle('active', index === activeKey);
      key.settings.hidden = index !== activeKey;
    }
  }

  async function render() {
    const currentVersion = ++version;
    const style = clickerStyle.value;
    const wholeName = style === 'name';
    perKeySettings.hidden = wholeName;
    nameSettings.hidden = !wholeName;
    hint.textContent = wholeName ? hint.dataset.name : hint.dataset.keys;
    remove.disabled = count === 1;
    add.disabled = count === maximum;
    for (const colour of [base, nameInk, nameFill, nameBorder]) colour.sync();
    for (const key of keys) {
      key.input.style.fontFamily = '"OGS Full ' + key.font.value + '"';
      key.row.style.setProperty('--clicker-cap', key.cap.value);
      key.row.style.setProperty('--clicker-ink', key.ink.value);
      key.cap.sync();
      key.ink.sync();
    }
    showKeySettings();
    const tooLong = wholeName && exceedsClickerTextLimit(clickerName.value);
    textLimit.hidden = !tooLong;
    clickerName.setAttribute('aria-invalid', String(tooLong));
    clickerName.setCustomValidity(tooLong ? textLimit.textContent : '');
    if (tooLong) return;
    if (!viewer) { status.textContent = status.dataset.noWebgl; return; }
    try {
      const sources = wholeName
        ? [{ text: clickerName.value.trim() || nameFont.selectedOptions[0].dataset.sample || clickerName.placeholder, font: nameFont.value }]
        : keys.slice(0, count).map(key => ({
          text: key.input.value.trim(), font: key.font.value, cap: key.cap.value, ink: key.ink.value,
        }));
      const entries = await Promise.all(sources.map(async entry => ({
        ...entry, text: entry.text.normalize('NFC'), font: await loadFont(entry.font),
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
        : { base: base.value };
      const size = viewer.update({ keys: entries, style, ...palette });
      const dimensions = document.querySelector('#clicker-dimensions');
      dimensions.textContent = dimensions.dataset.label + ' · ' + size.map(n => Number(n.toFixed(1))).join(' × ') + ' mm';
      status.textContent = unsupported ? status.dataset.unsupported : '';
    } catch {
      if (currentVersion === version) status.textContent = status.dataset.error;
    }
  }
  remove.addEventListener('click', () => {
    count = Math.max(1, count - 1);
    activeKey = Math.min(activeKey, count - 1);
    render();
  });
  add.addEventListener('click', () => {
    count = Math.min(maximum, count + 1);
    activeKey = count - 1;
    render();
    keys[activeKey].input.focus({ preventScroll: true });
  });
  clickerName.addEventListener('compositionend', render);
  form.addEventListener('input', event => { if (!event.isComposing) render(); });
  form.addEventListener('submit', event => event.preventDefault());
  setupClickerOrderTest(form, () => clickerStyle.value === 'name' ? {
    text: clickerName.value.trim(),
    font: nameFont.value,
    colors: { border: nameBorder.value, fill: nameFill.value, ink: nameInk.value },
  } : null);
  render();
}

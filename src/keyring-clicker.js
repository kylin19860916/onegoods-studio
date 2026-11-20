import { checkPrintFeatures, printWarning } from './printability.js';
import { loadPreviewFont } from './preview-fonts.js';
import { exceedsClickerTextLimit } from './clicker-test-pricing.js';
import { setupClickerOrderTest } from './clicker-order-test.js';
import { expandChoices } from './keyring-choices.js';
import { setupFontPicker } from './keyring-font-picker.js';
import { keycapFeatureContours, nameClickerContours } from '../server/keyring-geometry.mjs';
import { createClickerViewer } from './clicker-viewer.js';


export function setupClicker() {
  const form = document.querySelector('#clicker-form');
  const labels = document.querySelector('#clicker-labels');
  const template = document.querySelector('#clicker-label-template');
  const swatches = document.querySelector('#plate-swatch-options');
  const controls = labels.querySelector('.clicker-inline-controls');
  const status = document.querySelector('#clicker-status');
  const viewer = createClickerViewer(document.querySelector('#clicker-canvas'), document.querySelector('#clicker-view'), document.querySelector('#clicker-reset'), document.querySelector('#clicker-inspect'));
  form.addEventListener('toggle', event => {
    const picker = event.target;
    if (!picker.open || !picker.matches('.keyring-font-picker, [data-compact-colour]')) return;
    for (const other of form.querySelectorAll('.keyring-font-picker[open], [data-compact-colour][open]')) {
      if (other !== picker) other.open = false;
    }
  }, true);
  function setupColour(select, initial) {
    const field = select.parentElement;
    const picker = field.closest('details');
    const current = picker.querySelector('[data-clicker-current]');
    select.append(swatches.content.cloneNode(true));
    select.value = initial;
    expandChoices(select, { colours: true });
    if (picker.hasAttribute('data-compact-colour')) {
      const summary = picker.querySelector('summary');
      const close = () => { picker.open = false; };
      field.addEventListener('change', () => { close(); summary.focus(); });
      picker.addEventListener('keydown', event => {
        if (event.key === 'Escape' && picker.open) { close(); summary.focus(); }
      });
      picker.addEventListener('focusout', event => {
        if (event.relatedTarget && !picker.contains(event.relatedTarget)) close();
      });
      document.addEventListener('pointerdown', event => {
        if (picker.open && !picker.contains(event.target)) close();
      });
    }

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
  const previewDraft = new URLSearchParams(location.search).get('order-preview') === '1'
    ? JSON.parse(sessionStorage.getItem('ogs-order-preview') || 'null') : null;
  const saved = previewDraft?.kind === 'custom' && !previewDraft.submitted ? previewDraft.design : null;
  const base = setupColour(form.elements.base, '#393142');
  const nameInk = setupColour(form.elements.nameInk, saved?.colors.ink ?? '#fffcf5');
  const nameFill = setupColour(form.elements.nameFill, saved?.colors.fill ?? '#efb39e');
  const nameBorder = setupColour(form.elements.nameBorder, saved?.colors.border ?? '#f2c879');
  const { clickerStyle, clickerName } = form.elements;
  const perKeySettings = document.querySelector('#clicker-per-key-settings');
  const nameSettings = document.querySelector('#clicker-name-settings');
  const hint = document.querySelector('#clicker-hint');
  const textLimit = document.querySelector('#clicker-name-limit-error');
  const nameFont = document.querySelector('#plate-style').cloneNode(true);
  nameFont.id = 'clicker-name-font';
  nameFont.name = 'clickerNameFont';
  nameFont.value = saved?.font ?? 'huninn';
  if (saved) clickerName.value = saved.text;
  document.querySelector('#clicker-name-font-field').append(nameFont);
  setupFontPicker(nameFont);
  const remove = document.querySelector('#clicker-remove');
  const add = document.querySelector('#clicker-add');
  const keySettings = document.querySelector('#clicker-key-settings');
  const settingsTemplate = document.querySelector('#clicker-key-settings-template');
  let count = 2;
  let activeKey = 0;
  let version = 0;
  const maximum = 6;
  const maxKeys = () => clickerStyle.value === 'mechanical' ? maximum : 4;
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

  let exportDesign;
  async function render() {
    const currentVersion = ++version;
    const style = clickerStyle.value;
    const wholeName = style === 'name';
    if (!wholeName && count > maxKeys()) {
      count = maxKeys();
      activeKey = Math.min(activeKey, count - 1);
    }
    perKeySettings.hidden = wholeName;
    nameSettings.hidden = !wholeName;
    hint.textContent = wholeName ? hint.dataset.name : hint.dataset.keys;
    remove.disabled = count === 1;
    add.disabled = count === maxKeys();
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
    if (tooLong) { exportDesign=null; status.textContent=textLimit.textContent; return; }
    if (!viewer) { status.textContent = status.dataset.noWebgl; return; }
    try {
      const sources = wholeName
        ? [{ text: clickerName.value.trim() || nameFont.selectedOptions[0].dataset.sample || clickerName.placeholder, font: nameFont.value }]
        : keys.slice(0, count).map(key => ({
          text: key.input.value.trim(), font: key.font.value, cap: key.cap.value, ink: key.ink.value,
        }));
      const entries = await Promise.all(sources.map(async entry => ({
        ...entry, text: entry.text.normalize('NFC'), font: await loadPreviewFont(entry.font, entry.text || ' '),
      })));
      if (currentVersion !== version) return;
      for (const entry of entries) {
        if ([...entry.text].some(char => char !== ' ' && !entry.font.charToGlyphIndex(char))) {
          throw new Error(status.dataset.unsupported);
        }
      }
      const palette = wholeName
        ? { base: nameBorder.value, cap: nameFill.value, ink: nameInk.value }
        : { base: base.value };
      const featureWarnings=wholeName
        ? [checkPrintFeatures(nameClickerContours(entries[0].font,entries[0].text).lettering)]
        : entries.map(entry=>checkPrintFeatures(keycapFeatureContours(entry.font,entry.text)));
      const featureWarning=printWarning({thin:featureWarnings.some(result=>result.thin),narrow:featureWarnings.some(result=>result.narrow)});
      const size = viewer.update({ keys: entries, style, ...palette });
      exportDesign = wholeName ? {text:entries[0].text,font:entries[0].font.fontKey,colors:{border:nameBorder.value,fill:nameFill.value,ink:nameInk.value}} : style === 'mechanical' ? {style:'mechanical',base:base.value,keys:entries.map(entry=>({...entry,font:entry.font.fontKey}))} : null;
      const dimensions = document.querySelector('#clicker-dimensions');
      dimensions.textContent = dimensions.dataset.label + ' · ' + size.map(n => Number(n.toFixed(1))).join(' × ') + ' mm';
      status.textContent = entries.some(entry => entry.font.fallbackUsed) ? (document.documentElement.lang === 'en' ? 'Preview uses Noto Sans TC for missing characters.' : '缺少字元的字型已改用思源黑體顯示。') : '';
      status.textContent = [status.textContent, featureWarning].filter(Boolean).join(' ');
    } catch {
      if (currentVersion === version) {exportDesign=null;status.textContent = status.dataset.error;}
    }
  }
  remove.addEventListener('click', () => {
    count = Math.max(1, count - 1);
    activeKey = Math.min(activeKey, count - 1);
    render();
    form.dispatchEvent(new Event('clicker-key-count'));
  });
  add.addEventListener('click', () => {
    count = Math.min(maxKeys(), count + 1);
    activeKey = count - 1;
    render();
    form.dispatchEvent(new Event('clicker-key-count'));
    keys[activeKey].input.focus({ preventScroll: true });
  });
  clickerName.addEventListener('compositionend', render);
  form.addEventListener('input', event => { if (!event.isComposing) render(); });
  form.addEventListener('submit', event => event.preventDefault());
  const readContactDesign = () => clickerStyle.value === 'name' ? {
    text: clickerName.value.trim(),
    font: nameFont.value,
    colors: { border: nameBorder.value, fill: nameFill.value, ink: nameInk.value },
  } : clickerStyle.value === 'mechanical' ? {
    style: 'mechanical', base: base.value,
    keys: keys.slice(0, count).map(key => ({ text: key.input.value.trim(), font: key.font.value, cap: key.cap.value, ink: key.ink.value })),
  } : {
    style: 'individual', base: base.value,
    keys: keys.slice(0, count).map(key => ({text:key.input.value.trim(),font:key.font.value,cap:key.cap.value,ink:key.ink.value})),
  };
  setupClickerOrderTest(form, readContactDesign);
  if (new URLSearchParams(location.search).get('admin') === '1') {
    const button=document.createElement('button');
    button.type='button';button.className='button cream';button.textContent='Export 3MF';
    button.addEventListener('click',async()=>{
      if (!exportDesign) {status.textContent='3MF export is available for connected and mechanical clickers.';return;}
      button.disabled=true;
      try {
        const module=await import(document.body.dataset.exportModule);
        await module.exportClicker(exportDesign);
      } catch {status.textContent='3MF export failed. Please try again.';}
      finally {button.disabled=false;}
    });
    form.append(button);
  }

  const contactDesign = document.querySelector('#clicker-contact-design');
  contactDesign?.addEventListener('click', () => {
    const content = JSON.stringify(readContactDesign(), null, 2);
    location.href = 'mailto:aka051118@gmail.com?subject=' + encodeURIComponent('OGS 客製設計確認') + '&body=' + encodeURIComponent(content);
    document.querySelector('#design-contact-status').textContent = document.documentElement.lang === 'en'
      ? 'Send the draft from your email app to contact us.'
      : document.documentElement.lang === 'zh-Hans' ? '请在邮件程序中发送设计资料给我们。' : '請在郵件程式中寄出設計資料給我們。';
  });
  render();
}

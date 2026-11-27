import { articulatedNameCharacters, articulatedNameLimit, parseKeyringFont, generateKeyring } from '../server/keyring-geometry.mjs';
import { createKeyringViewer } from './keyring-viewer.js';
import { setupClicker } from './keyring-clicker.js';
import { expandChoices } from './keyring-choices.js';
import { keyringFonts, setupFontPicker } from './keyring-font-picker.js';

const form = document.querySelector('#nameplate-form');
const preview = document.querySelector('#plate-preview');
const canvas = document.querySelector('#plate-canvas');
const host = document.querySelector('#plate-view');
const reset = document.querySelector('#plate-reset-view');
const customTabs = document.querySelector('#r2-type-tabs');
const params = new URLSearchParams(location.search);
const customTypes = window.OGSCustomTypes || [];
if (!customTabs && customTypes.length) {
  const oldStyle = params.get('style') || location.hash.slice(1);
  params.delete('style');
  params.set('type', customTypes.find(type => type.style === oldStyle)?.id || 'nameplate');
  location.replace('custom?' + params.toString());
}
const language = document.documentElement.lang;
const summaryLabels = ({
  'zh-Hant': ['款式', '名字', '字型', '顏色', '尺寸'],
  'zh-Hans': ['款式', '名字', '字型', '颜色', '尺寸'],
  en: ['Style', 'Name', 'Typeface', 'Colors', 'Size'],
})[language];

function updateSummary(form, values) {
  const rows = values.flatMap((value, index) => {
    if (!value) return [];
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = summaryLabels[index];
    detail.textContent = value;
    return [term, detail];
  });
  form.querySelector('[data-r2-summary]').replaceChildren(...rows);
}

let viewer = null;
function showKeyringViewer() {
  if (viewer) return;
  viewer = createKeyringViewer(canvas, host, reset);
  if (!viewer) return;
  canvas.hidden = false;
  preview.setAttribute('hidden', '');
  reset.hidden = false;
  document.querySelector('#plate-view-hint').hidden = false;
}
const previewStatus = document.querySelector('#plate-preview-status');
const dimensions = document.querySelector('#keyring-dimensions');
const exportStatus = document.querySelector('#plate-status');
const generate = document.querySelector('#keyring-generate');
const headings = document.querySelectorAll('[data-keyring-intro]');
const keyringPanel = document.querySelector('#name-tag');
const clickerPanel = document.querySelector('#name-clicker');
const nameTagOptions = form.querySelectorAll('[data-name-tag-only]');
const articulatedOptions = form.querySelectorAll('[data-articulated-only]');
const swatches = document.querySelector('#plate-swatch-options');
for (const select of form.querySelectorAll('[data-swatch]')) {
  select.append(swatches.content.cloneNode(true));
  select.value = select.dataset.default;
  expandChoices(select, { colours: true });
}
const { nameText, style, baseColor, textColor } = form.elements;
const download = document.querySelector('#plate-download');
const payment = document.querySelector('#plate-payment');
const articulatedPrice = document.querySelector('#articulated-price');
const articulatedAmount = articulatedPrice.querySelector('output');
const spelling = form.querySelector('[data-r2-spelling]');
let nameReady = false;
spelling.addEventListener('change', () => { generate.disabled = !nameReady || !spelling.checked; });
const articulatedFirstPrice = 80;
const articulatedExtraPrice = 40;

const fonts = keyringFonts;
const refreshFontPicker = setupFontPicker(style);
const nameplateFonts = new Set(['gensen-tw', 'huninn', 'tw-kai', 'lilita', 'nunito', 'chewy']);
const defaultNameplateFont = language === 'en' ? 'lilita' : 'gensen-tw';
const selectedFonts = { 'name-tag': defaultNameplateFont, 'name-articulated': 'sans-tc' };
const nameplateHeightMm = 27; // Existing medium template height, including the outline allowance.
const nameplateMaxWidthMm = 80; // Existing largest nameplate width.
let fontMode;
const spec = { baseMm: 3, letteringMm: 1, holeMm: 4, rimMm: 1.8 };
let currentFont;
let fontPromise;
let previewVersion = 0;
let timer;
let articulated = false;

function loadFont(key) {
  if (key === currentFont && fontPromise) return fontPromise;
  currentFont = key;
  const pending = fetch('/assets/fonts/keyring/' + fonts[key])
    .then(response => {
      if (!response.ok) throw new Error('Font unavailable');
      return response.arrayBuffer();
    })
    .then(bytes => parseKeyringFont(new Uint8Array(bytes)))
    .catch(error => {
      if (fontPromise === pending) fontPromise = undefined;
      throw error;
    });
  fontPromise = pending;
  return pending;
}

function shade(color) {
  const parts = color.slice(1).match(/../g);
  return '#' + parts.map(part => Math.round(parseInt(part, 16) * 0.72).toString(16).padStart(2, '0')).join('');
}

async function render(version) {
  previewStatus.textContent = previewStatus.dataset.loading;
  try {
    const font = await loadFont(style.value);
    if (version !== previewVersion) return;
    const base = baseColor.value;
    const ink = textColor.value;
    const enteredName = nameText.value.trim();
    const sample = style.selectedOptions[0].dataset.sample ? 'Mia' : '小飛';
    const name = enteredName || (articulated ? 'OGS' : sample);
    const model = generateKeyring(font, name, {
      ...spec, widthMm: Infinity, heightMm: nameplateHeightMm,
      shape: articulated ? 'articulated' : 'contour', baseColor: base, textColor: ink,
    });
    if (!articulated && model.dimensions[0] > nameplateMaxWidthMm) {
      throw new RangeError(previewStatus.dataset.nameplateLength);
    }
    const colors = { base, side: shade(base), ink, shadow: shade(ink) };
    for (const [part, color] of Object.entries(colors)) {
      preview.style.setProperty('--plate-' + part, color);
    }
    preview.setAttribute('viewBox', model.preview.viewBox.join(' '));
    preview.querySelectorAll('[data-outline]').forEach(path => {
      path.setAttribute('d', model.preview[path.dataset.outline]);
    });
    viewer?.setMeshes(model.meshes, { fit: true });
    const numbers = model.dimensions.map(value => Number(value.toFixed(1)));
    dimensions.textContent = articulated
      ? dimensions.dataset.label + ' · ' + numbers.join(' × ') + ' mm'
      : previewStatus.dataset.approximate + ' ' + numbers.slice(0, 2).join(' × ') + ' mm';
    previewStatus.textContent = '';
    nameReady = Boolean(enteredName);
    generate.disabled = !nameReady || !spelling.checked;
    updateKeyringSummary();
  } catch (error) {
    if (version !== previewVersion) return;
    viewer?.setMeshes([]);
    dimensions.textContent = '';
    updateKeyringSummary();
    preview.querySelectorAll('[data-outline]').forEach(path => path.removeAttribute('d'));
    if (error.message === '有字元不在此款支援的字型中。') previewStatus.textContent = previewStatus.dataset.unsupported;
    else previewStatus.textContent = error.message === previewStatus.dataset.nameplateLength
      ? previewStatus.dataset.nameplateLength : previewStatus.dataset.error;
  }
}

function updateKeyringSummary() {
  const type = customTypes.find(item => item.id === (articulated ? 'articulated' : 'nameplate'));
  const colors = [...form.querySelectorAll('[data-keyring-current]')];
  updateSummary(form, [
    type?.text[language === 'en' ? 2 : language === 'zh-Hans' ? 1 : 0],
    nameText.value.trim(), style.selectedOptions[0]?.textContent,
    colors.map(node => node.querySelector('span').textContent).join(' · '),
    dimensions.textContent.split(' · ').at(-1),
  ]);
}

function queuePreview() {
  if (keyringPanel.hidden) return;
  const version = ++previewVersion;
  generate.disabled = true;
  nameReady = false;
  const tooLong = articulated
    && articulatedNameCharacters(nameText.value.trim()).length > articulatedNameLimit;
  nameText.setCustomValidity(tooLong ? previewStatus.dataset.articulatedLength : '');
  for (const [name, field] of Object.entries({ baseColor, textColor })) {
    const current = form.querySelector('[data-keyring-current="' + name + '"]');
    const selected = form.querySelector('input[name="' + name + '"]:checked');
    current.querySelector('i').style.backgroundColor = field.value;
    current.querySelector('span').textContent = selected.closest('label').querySelector('span').textContent;
  }
  download.hidden = true;
  payment.hidden = true;
  generate.hidden = false;
  download.removeAttribute('href');
  exportStatus.textContent = '';
  clearTimeout(timer);
  const count = articulatedNameCharacters(nameText.value.trim()).length;
  articulatedPrice.hidden = !articulated || tooLong;
  articulatedAmount.value = count
    ? 'NT$' + (articulatedFirstPrice + (count - 1) * articulatedExtraPrice)
    : articulatedAmount.dataset.start.replace('%s', articulatedFirstPrice);
  updateKeyringSummary();
  if (tooLong) {
    viewer?.setMeshes([]);
    dimensions.textContent = '';
    preview.querySelectorAll('[data-outline]').forEach(path => path.removeAttribute('d'));
    previewStatus.textContent = nameText.validationMessage;
  } else {
    timer = setTimeout(() => render(version), 120);
  }
}

function exportImage() {
  if (viewer) {
    try {
      download.href = viewer.image();
      download.hidden = false;
      payment.hidden = false;
      generate.hidden = true;
      exportStatus.textContent = exportStatus.dataset.ready;
    } catch {
      exportStatus.textContent = exportStatus.dataset.error;
    }
    return;
  }
  const version = previewVersion;
  const svg = preview.cloneNode(true);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', '1350');
  svg.setAttribute('height', '645');
  const originalPaths = preview.querySelectorAll('path');
  svg.querySelectorAll('path').forEach((path, index) => {
    path.setAttribute('fill', getComputedStyle(originalPaths[index]).fill);
  });
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    if (version !== previewVersion) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1350;
      canvas.height = 645;
      canvas.getContext('2d').drawImage(image, 0, 0);
      download.href = canvas.toDataURL('image/png');
      download.hidden = false;
      payment.hidden = false;
      generate.hidden = true;
      exportStatus.textContent = exportStatus.dataset.ready;
    } catch {
      exportStatus.textContent = exportStatus.dataset.error;
    }
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    if (version === previewVersion) exportStatus.textContent = exportStatus.dataset.error;
  };
  image.src = url;
}

form.addEventListener('input', event => { if (event.target !== spelling) queuePreview(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!generate.disabled) exportImage();
});
function requestedProduct() {
  if (customTabs) {
    return customTypes.find(type => type.id === new URLSearchParams(location.search).get('type'))?.style || 'name-tag';
  }
  const styles = ['name-tag', 'name-clicker', 'name-articulated'];
  const requested = location.hash.slice(1);
  const queryStyle = new URLSearchParams(location.search).get('style');
  if (styles.includes(requested)) return requested;
  return styles.includes(queryStyle) ? queryStyle : 'name-tag';
}

function showProduct() {
  const selected = requestedProduct();
  articulated = selected === 'name-articulated';
  articulatedPrice.hidden = true;
  keyringPanel.hidden = selected === 'name-clicker';
  clickerPanel.hidden = !keyringPanel.hidden;
  for (const heading of headings) heading.hidden = heading.dataset.keyringIntro !== selected;
  for (const option of nameTagOptions) option.hidden = articulated;
  for (const option of articulatedOptions) option.hidden = !articulated;
  for (const group of form.querySelectorAll('.keyring-colour-section')) {
    const label = group.querySelector(articulated ? 'summary [data-articulated-only]' : 'summary [data-name-tag-only]');
    group.querySelector('legend').textContent = label.textContent;
  }
  download.download = articulated ? 'OGS-articulated-preview.png' : 'OGS-keyring-preview.png';
  if (keyringPanel.hidden) {
    previewVersion++;
    viewer?.dispose();
    viewer = null;
  } else {
    showKeyringViewer();
    if (fontMode !== selected) {
      if (fontMode) selectedFonts[fontMode] = style.value;
      fontMode = selected;
      style.value = selectedFonts[selected];
      refreshFontPicker(articulated ? null : nameplateFonts);
    }
    queuePreview();
  }
}

const clicker = setupClicker({ active: requestedProduct() === 'name-clicker', updateSummary });
showProduct();
if (customTabs) {
  const panel = document.querySelector('#r2-custom-panel');
  const shared = document.querySelector('#r2-shared-name');
  const sharedField = shared.closest('.r2-shared-field');
  const keyringOptions = form.querySelector('.keyring-shared');
  const clickerNameOptions = clickerPanel.querySelector('.keyring-step-panel');
  const localeIndex = document.documentElement.lang === 'en' ? 2 : document.documentElement.lang === 'zh-Hans' ? 1 : 0;
  shared.value = params.get('name')?.trim() || (params.has('custom-order') ? clicker.getName() : '');
  const tabs = customTypes.map(type => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'r2-tab-' + type.id;
    button.setAttribute('role','tab');
    button.setAttribute('aria-controls',panel.id);
    const photo = document.createElement('img');
    photo.src = '/assets/custom/tabs/' + type.id + '-' + language.toLowerCase() + '.webp';
    photo.alt = '';
    photo.width = 104;
    photo.height = 36;
    button.setAttribute('aria-label', type.text[localeIndex]);
    button.append(photo);
    if (language === 'en') button.append(type.text[localeIndex]);
    customTabs.append(button);
    button.addEventListener('click',() => choose(type));
    return button;
  });
  function mirrorName() {
    nameText.value = shared.value;
    nameText.dispatchEvent(new Event('input',{ bubbles: true }));
    clicker.setName(shared.value);
  }
  function choose(type, { focus = false } = {}) {
    const url = new URL(location.href);
    const switched = url.searchParams.get('type') !== type.id;
    url.searchParams.set('type',type.id);
    if (shared.value.trim()) url.searchParams.set('name',shared.value.trim());
    else url.searchParams.delete('name');
    history.replaceState(null,'',url);
    (type.id === 'press' ? clickerNameOptions : keyringOptions).prepend(sharedField);
    shared.setAttribute('aria-describedby', type.id === 'press' ? 'clicker-key-limit clicker-name-limit clicker-name-limit-error' : 'plate-preview-status');
    shared.removeAttribute('aria-invalid');
    showProduct();
    clicker.setActive(type.id === 'press');
    tabs.forEach((button,index) => {
      const selected = customTypes[index] === type;
      button.tabIndex = selected ? 0 : -1;
      button.setAttribute('aria-selected',String(selected));
      if (selected) {
        panel.setAttribute('aria-labelledby',button.id);
        if (focus) button.focus();
      }
    });
    if (switched && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.animate([{opacity:.65},{opacity:1}],{duration:150});
    }
    mirrorName();
  }
  customTabs.addEventListener('keydown',event => {
    const current = tabs.indexOf(event.target);
    if (current < 0) return;
    const next = {ArrowRight:(current+1)%tabs.length, ArrowLeft:(current+tabs.length-1)%tabs.length, Home:0, End:tabs.length-1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    choose(customTypes[next],{focus:true});
  });
  function updateSharedName() {
    spelling.checked = false;
    mirrorName();
  }
  shared.addEventListener('input', event => {
    event.stopPropagation();
    if (!event.isComposing) updateSharedName();
  });
  shared.addEventListener('compositionend', event => {
    event.stopPropagation();
    updateSharedName();
  });
  const comparison = document.querySelector('#r2-custom-comparison');
  const headings = comparison.createTHead().insertRow();
  headings.append(document.createElement('th'));
  const body = comparison.createTBody();
  const play = body.insertRow();
  play.insertCell().textContent = ['玩法','玩法','How to use'][localeIndex];
  const row = body.insertRow();
  row.insertCell().textContent = ['可選設定','可选设置','Options'][localeIndex];
  const dispatch = comparison.tBodies[0].insertRow();
  dispatch.insertCell().textContent = ['出貨','出货','Dispatch'][localeIndex];
  const prices = body.insertRow();
  prices.insertCell().textContent = ['價格','价格','Price'][localeIndex];
  customTypes.forEach(type => {
    const header = document.createElement('th');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-text';
    button.textContent = type.text[localeIndex];
    button.addEventListener('click',() => { choose(type,{focus:true}); customTabs.scrollIntoView({block:'nearest'}); });
    header.append(button);
    headings.append(header);
    play.insertCell().textContent = type.play[localeIndex];
    prices.insertCell().textContent = type.priceLabel?.[localeIndex] ?? (type.startingPrice ? ('NT$' + type.startingPrice + (localeIndex === 2 ? '+' : ' 起')) : '—');
    row.insertCell().textContent = type.description[localeIndex];
    dispatch.insertCell().textContent = localeIndex === 2 ? `Within ${type.dispatchDays} days` : `${type.dispatchDays} 天內`;
  });
  // Existing links that land directly on a named clicker still open that ordering mode.
  if (params.get('type') === 'press' && shared.value.trim()) clicker.showNamedStyle();
  choose(customTypes.find(type => type.id === params.get('type')) || customTypes[0]);
} else {
  window.addEventListener('hashchange', showProduct);
}

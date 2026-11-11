import { parseKeyringFont, generateKeyring } from '../server/keyring-geometry.mjs';
import { createKeyringViewer } from './keyring-viewer.js';
import { setupClicker } from './keyring-clicker.js';
import { expandChoices } from './keyring-choices.js';

const form = document.querySelector('#nameplate-form');
const preview = document.querySelector('#plate-preview');
const position = document.querySelector('#plate-position');
const canvas = document.querySelector('#plate-canvas');
const host = document.querySelector('#plate-view');
const reset = document.querySelector('#plate-reset-view');
const viewer = createKeyringViewer(canvas, host, reset);
if (viewer) {
  canvas.hidden = false;
  preview.setAttribute('hidden', '');
  reset.hidden = false;
  document.querySelector('#plate-view-hint').hidden = false;
}
const previewStatus = document.querySelector('#plate-preview-status');
const dimensions = document.querySelector('#keyring-dimensions');
const exportStatus = document.querySelector('#plate-status');
const generate = document.querySelector('#keyring-generate');
const designStep = document.querySelector('#keyring-design');
const colorsStep = document.querySelector('#keyring-colors');
const multiColors = document.querySelector('#keyring-multiple-colors');
const accent = document.querySelector('#keyring-accent');
const progress = document.querySelectorAll('.keyring-steps li');
const swatches = document.querySelector('#plate-swatch-options');
for (const select of form.querySelectorAll('[data-swatch]')) {
  select.append(swatches.content.cloneNode(true));
  select.value = select.dataset.default;
  expandChoices(select, { colours: true });
}
const { nameText, style, shape, size, mode, baseColor, textColor, useAccent, accentColor } = form.elements;
const download = document.querySelector('#plate-download');
const payment = document.querySelector('#plate-payment');

const fonts = {
  huninn: 'Huninn-Regular.woff',
  'sans-tc': 'NotoSansTC-Bold.woff',
  'serif-tc': 'NotoSerifTC-Bold.woff',
  'sans-sc': 'NotoSansSC-Bold.woff',
  'serif-sc': 'NotoSerifSC-Bold.woff',
};
const sizes = { small: [50, 20.8], medium: [65, 27], large: [80, 33.2] };
const spec = { baseMm: 3, letteringMm: 1, holeMm: 4, rimMm: 1.8 };
let currentFont;
let fontPromise;
let previewVersion = 0;
let timer;

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

function showStep(step) {
  const editingColors = step === 1;
  designStep.hidden = editingColors;
  colorsStep.hidden = !editingColors;
  progress.forEach((item, index) => {
    if (index === step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  (editingColors ? colorsStep : designStep).querySelector('h2').focus();
}

async function render(version) {
  previewStatus.textContent = previewStatus.dataset.loading;
  try {
    const font = await loadFont(style.value);
    if (version !== previewVersion) return;
    const base = baseColor.value;
    const ink = mode.value === 'single' ? base : textColor.value;
    const third = mode.value === 'dual' && useAccent.checked ? accentColor.value : undefined;
    const [widthMm, heightMm] = sizes[size.value];
    const model = generateKeyring(font, nameText.value.trim() || nameText.placeholder, {
      ...spec, widthMm, heightMm, shape: shape.value, baseColor: base, textColor: ink, accentColor: third,
    });
    const colors = { base, side: third || shade(base), ink, shadow: shade(ink) };
    for (const [part, color] of Object.entries(colors)) {
      preview.style.setProperty('--plate-' + part, color);
    }
    const [x, y, width, height] = model.preview.viewBox;
    position.setAttribute('transform', `translate(${45 - x - width / 2} ${20 - y - height / 2})`);
    preview.querySelectorAll('[data-outline]').forEach(path => {
      path.setAttribute('d', model.preview[path.dataset.outline]);
    });
    viewer?.setMeshes(model.meshes);
    const numbers = model.dimensions.map(value => Number(value.toFixed(1)));
    dimensions.textContent = dimensions.dataset.label + ' · ' + numbers.join(' × ') + ' mm';
    previewStatus.textContent = '';
    generate.disabled = !nameText.value.trim();
  } catch {
    if (version !== previewVersion) return;
    viewer?.setMeshes([]);
    dimensions.textContent = '';
    preview.querySelectorAll('[data-outline]').forEach(path => path.removeAttribute('d'));
    previewStatus.textContent = previewStatus.dataset.error;
  }
}

function queuePreview() {
  const version = ++previewVersion;
  generate.disabled = true;
  multiColors.hidden = mode.value === 'single';
  accent.hidden = !useAccent.checked;
  download.hidden = true;
  payment.hidden = true;
  generate.hidden = false;
  download.removeAttribute('href');
  exportStatus.textContent = '';
  clearTimeout(timer);
  timer = setTimeout(() => render(version), 120);
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

form.addEventListener('input', queuePreview);
document.querySelectorAll('[data-keyring-step]').forEach(button => {
  button.addEventListener('click', () => showStep(Number(button.dataset.keyringStep)));
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!generate.disabled) exportImage();
});
queuePreview();

setupClicker();

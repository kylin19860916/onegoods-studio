(() => {
  const form = document.querySelector('#nameplate-form');
  if (!form) return;

  const { nameText, palette, shape } = form.elements;
  const preview = document.querySelector('#plate-preview');
  const lettering = document.querySelector('#plate-lettering');
  const face = document.querySelector('#plate-text');
  const summary = document.querySelector('#plate-summary');
  const status = document.querySelector('#plate-status');
  const palettes = {
    lavender: ['#a087c1', '#745895', '#fffcf5', '#493461'],
    honey: ['#f2c879', '#ba873c', '#292331', '#755a3d'],
    charcoal: ['#393142', '#211a2b', '#fffcf5', '#a087c1'],
  };

  function render() {
    const name = nameText.value.trim();
    face.textContent = name || nameText.placeholder;
    lettering.setAttribute('font-size', '66');
    const width = face.getComputedTextLength();
    if (width > 510) lettering.setAttribute('font-size', String(66 * 510 / width));

    const [base, side, ink, shadow] = palettes[palette.value];
    for (const [part, color] of Object.entries({ base, side, ink, shadow })) {
      preview.style.setProperty('--plate-' + part, color);
    }
    for (const layer of preview.querySelectorAll('rect')) {
      layer.setAttribute('rx', shape.value === 'pill' ? '75' : '24');
    }

    summary.value = name ? [
      nameText.labels[0].textContent.trim() + '：' + name,
      shape.labels[0].textContent.trim() + '：' + shape.selectedOptions[0].textContent,
      palette.labels[0].textContent.trim() + '：' + palette.selectedOptions[0].textContent,
    ].join('\n') : '';
    status.textContent = '';
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!summary.value) {
      nameText.focus();
      return;
    }
    try {
      await navigator.clipboard.writeText(summary.value);
      status.textContent = status.dataset.copied;
    } catch {
      summary.focus();
      summary.select();
      status.textContent = status.dataset.manual;
    }
  });

  render();
  document.fonts.ready.then(render);
})();

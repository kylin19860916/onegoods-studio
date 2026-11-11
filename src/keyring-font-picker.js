export const keyringFonts = {
  huninn: 'Huninn-Regular.woff',
  'sans-tc': 'NotoSansTC-Bold.woff',
  'serif-tc': 'NotoSerifTC-Bold.woff',
  'sans-sc': 'NotoSansSC-Bold.woff',
  'serif-sc': 'NotoSerifSC-Bold.woff',
  wenkai: 'wenkai.woff', kuaile: 'kuaile.woff',
  lucky: 'lucky.woff', nunito: 'nunito.woff', lobster: 'lobster.woff',
  lilita: 'lilita.woff', chewy: 'chewy.woff', yellowtail: 'yellowtail.woff', blackops: 'blackops.woff',
};

export function setupFontPicker(select) {
  const picker = document.createElement('details');
  picker.className = 'keyring-font-picker';
  const summary = document.createElement('summary');
  const selected = document.createElement('span');
  const selectedName = document.createElement('small');
  summary.append(selected, selectedName);
  picker.append(summary);
  const menu = document.createElement('div');
  menu.className = 'keyring-font-menu';
  picker.append(menu);
  const radios = [];
  function sample(option) {
    const element = document.createElement('span');
    element.className = 'keyring-font-sample';
    element.style.fontFamily = '"OGS Preview ' + option.value + '"';
    element.textContent = option.dataset.sample || '林予曦';
    return element;
  }
  function update() {
    const option = select.selectedOptions[0];
    selected.replaceChildren(sample(option));
    selectedName.textContent = option.textContent;
    radios.forEach(input => { input.checked = input.value === select.value; });
  }
  for (const group of select.querySelectorAll('optgroup')) {
    const field = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = group.label;
    field.append(legend);
    for (const option of group.children) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'fontPreviewChoice';
      input.value = option.value;
      input.setAttribute('aria-label', option.textContent);
      radios.push(input);
      const name = document.createElement('small');
      name.textContent = option.textContent;
      label.append(input, sample(option), name);
      field.append(label);
      input.addEventListener('input', event => {
        event.stopPropagation();
        select.value = input.value;
        update();
        picker.open = false;
        summary.focus();
        select.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    menu.append(field);
  }
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape') { picker.open = false; summary.focus(); }
  });
  picker.addEventListener('focusout', event => {
    if (event.relatedTarget && !picker.contains(event.relatedTarget)) picker.open = false;
  });
  document.addEventListener('pointerdown', event => {
    if (!picker.contains(event.target)) picker.open = false;
  });
  const caption = select.parentElement.querySelector('label');
  caption.removeAttribute('for');
  caption.id = 'plate-style-label';
  summary.setAttribute('aria-labelledby', caption.id);
  select.hidden = true;
  select.after(picker);
  update();
}

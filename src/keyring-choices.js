// Use native radio groups for visible, keyboard-accessible choices.
export function expandChoices(select, { colours = false } = {}) {
  const caption = select.parentElement.querySelector('label');
  const group = document.createElement('fieldset');
  group.className = 'keyring-choice-group' + (colours ? ' keyring-colour-options' : '');
  group.id = select.id;
  const legend = document.createElement('legend');
  legend.textContent = caption.textContent;
  group.append(legend);
  for (const option of select.options) {
    const label = document.createElement('label');
    label.className = 'keyring-choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = select.name;
    input.value = option.value;
    input.checked = option.selected;
    label.append(input);
    if (colours) {
      const chip = document.createElement('i');
      chip.className = 'keyring-colour-chip';
      chip.style.backgroundColor = option.value;
      chip.setAttribute('aria-hidden', 'true');
      label.append(chip);
    }
    const text = document.createElement('span');
    text.textContent = option.textContent;
    label.append(text);
    group.append(label);
  }
  caption.remove();
  select.replaceWith(group);
}

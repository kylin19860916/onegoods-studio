const styleTabs = document.querySelector('.custom-style-tabs');

if (styleTabs) {
  const tabs = [...styleTabs.querySelectorAll('button')];
  const panels = tabs.map(tab => document.getElementById(tab.dataset.customPanel));

  styleTabs.setAttribute('role', 'tablist');
  styleTabs.setAttribute('aria-labelledby', 'custom-styles-title');

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
  });

  function selectTab(selectedIndex) {
    tabs.forEach((tab, index) => {
      const selected = index === selectedIndex;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
  }

  selectTab(0);
  styleTabs.hidden = false;

  styleTabs.addEventListener('click', event => {
    const index = tabs.indexOf(event.target.closest('button'));
    if (index >= 0) selectTab(index);
  });

  styleTabs.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target);
    const moves = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (index < 0 || !Object.hasOwn(moves, event.key)) return;
    event.preventDefault();
    selectTab(moves[event.key]);
    tabs[moves[event.key]].focus();
  });
}

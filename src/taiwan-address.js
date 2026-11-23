(() => {
  const dataset = __OGS_TW_ADDRESS_DATA__;
  const data = dataset.cities;
  const excludedCities = new Set(dataset.unsupportedCities);
  const excludedDistricts = new Set(dataset.unsupportedDistricts);
  window.OGSTaiwanAddress = { setup(form) {
    const city = form.elements.city, district = form.elements.district, postal = form.elements.postalCode;
    const initial = {city:city.value,district:district.value};
    const option = (value) => new Option(value, value);
    const cities = Object.keys(data).filter(name => !excludedCities.has(name));
    city.replaceChildren(city.options[0], ...cities.map(option));
    if (cities.includes(initial.city)) city.value = initial.city;
    function updateDistricts(selected = '') {
      const districts = Object.entries(data[city.value] || {}).filter(([name]) => !excludedDistricts.has(name));
      district.replaceChildren(district.options[0], ...districts.map(([name]) => option(name)));
      district.disabled = !districts.length;
      district.value = districts.some(([name]) => name === selected) ? selected : '';
      postal.value = data[city.value]?.[district.value] || '';
    }
    city.addEventListener('change', () => updateDistricts());
    district.addEventListener('change', () => { postal.value = data[city.value]?.[district.value] || ''; });
    updateDistricts(initial.district);
  }};
})();

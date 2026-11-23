import data from '../src/taiwan-address-data.json';
const cities = data.cities as Record<string, Record<string, string>>;
const excludedCities = new Set(data.unsupportedCities);
const excludedDistricts = new Set(data.unsupportedDistricts);
export function validHomeAddress(city: string, district: string, postalCode: string) {
  const canonicalCity = city.replaceAll('台', '臺');
  const canonicalDistrict = district.replaceAll('台', '臺');
  const districts = Object.hasOwn(cities, canonicalCity) ? cities[canonicalCity] : null;
  return !excludedCities.has(canonicalCity) && !excludedDistricts.has(canonicalDistrict) &&
    Boolean(districts && Object.hasOwn(districts, canonicalDistrict) &&
      /^\d{3}(?:\d{2,3})?$/.test(postalCode) && postalCode.startsWith(districts[canonicalDistrict]));
}

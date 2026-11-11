const tierA = Object.freeze({ id: 'test-a', code: 'A', amount: 299 });
const tierB = Object.freeze({ id: 'test-b', code: 'B', amount: 399 });

export function quoteClickerTest(input) {
  const text = typeof input === 'string' ? input.trim().normalize('NFC') : '';
  if (!/^[\p{L}\p{N} .’'-]{1,16}$/u.test(text) || !/[\p{L}\p{N}]/u.test(text)) return null;
  const length = [...text.replaceAll(' ', '')].length;
  return { text, tier: length <= 3 ? tierA : tierB };
}

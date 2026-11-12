const tierA = Object.freeze({ id: 'test-a', code: 'A', amount: 299 });
const tierB = Object.freeze({ id: 'test-b', code: 'B', amount: 399 });

// Count in units of 1/8 of a full-width character, with a five-character budget.
export function exceedsClickerTextLimit(input) {
  if (typeof input !== 'string') return false;
  let width = 0;
  for (const character of input.trim().normalize('NFC')) {
    if (character === ' ') continue;
    width += /[\p{Script=Latin}\p{N}.’'-]/u.test(character) ? 5 : 8;
    if (width > 40) return true;
  }
  return false;
}

export function quoteClickerTest(input) {
  const text = typeof input === 'string' ? input.trim().normalize('NFC') : '';
  if (!/^[\p{L}\p{N} .’'-]{1,16}$/u.test(text) || !/[\p{L}\p{N}]/u.test(text) || exceedsClickerTextLimit(text)) return null;
  const length = [...text.replaceAll(' ', '')].length;
  return { text, tier: length <= 3 ? tierA : tierB };
}

// The agreed SKU prices are used only by the ECPay test checkout here.
const stagePrices = [80, 140, 200, 250, 290, 330, 370, 410];
export function quoteClickerEcpayStage(input) {
  const quote = quoteClickerTest(input);
  if (!quote) return null;
  const length = [...quote.text.replaceAll(' ', '')].length;
  return { text: quote.text, tier: { id: 'ecpay-stage', amount: stagePrices[length - 1] } };
}

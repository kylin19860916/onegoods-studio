export function isLocalCheckoutTest(url: URL) {
  return import.meta.env.DEV && ['127.0.0.1', 'localhost'].includes(url.hostname);
}

export function isCheckoutTestHost(url: URL) {
  return isLocalCheckoutTest(url) || url.origin === 'https://onegoods.studio';
}

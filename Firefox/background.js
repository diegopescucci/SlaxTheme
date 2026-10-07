// Firefox uses the Promise based WebExtension API and a persistent background page.
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== 'slax-web-playback' || !sender.tab || !/^https:\/\/(music\.youtube\.com|www\.youtube\.com|music\.apple\.com)\//.test(sender.url || '')) return;
  browser.runtime.sendMessage(message).catch(() => {});
});

const suggestionCache = new Map();
const suggestionRequests = new Map();
browser.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'slax-search-suggestions') return undefined;
  if ((sender.id && sender.id !== browser.runtime.id) || typeof message.query !== 'string') return Promise.resolve([]);
  const query = message.query.trim().slice(0, 200);
  if (query.length < 2) return Promise.resolve([]);
  const language = ['it', 'en', 'es', 'fr', 'de'].includes(message.language) ? message.language : 'en';
  const key = `${language}:${query}`;
  const owner = sender.documentId || sender.tab?.id || sender.url || 'dashboard';
  suggestionRequests.get(owner)?.abort();
  const cached = suggestionCache.get(key);
  if (cached && cached.expires > Date.now()) return Promise.resolve(cached.items);
  const controller = new AbortController();
  suggestionRequests.set(owner, controller);
  const timeout = setTimeout(() => controller.abort(), 4000);
  return fetch(`https://suggestqueries.google.com/complete/search?${new URLSearchParams({ client: 'firefox', hl: language, q: query })}`, { signal: controller.signal })
    .then(response => { if (!response.ok) throw Error('Suggestions unavailable'); return response.json(); })
    .then(data => {
      const items = Array.isArray(data?.[1]) ? [...new Set(data[1].filter(item => typeof item === 'string' && item.length < 300))].slice(0, 8) : [];
      if (suggestionCache.size >= 100) suggestionCache.delete(suggestionCache.keys().next().value);
      suggestionCache.set(key, { items, expires: Date.now() + 300000 });
      return items;
    })
    .catch(() => [])
    .finally(() => { clearTimeout(timeout); if (suggestionRequests.get(owner) === controller) suggestionRequests.delete(owner); });
});

browser.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'slax-get-instagram-session') return undefined;
  if (sender.id !== browser.runtime.id) return Promise.resolve(null);
  if (!browser.cookies?.get) return Promise.resolve(null);
  return browser.cookies.get({ url: 'https://www.instagram.com', name: 'sessionid' })
    .then(cookie => cookie?.value ? `sessionid=${cookie.value}` : null)
    .catch(() => null);
});


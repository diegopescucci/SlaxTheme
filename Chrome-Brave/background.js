// Slax Background Service Worker - Global Keyboard Shortcuts
// chrome.tabs.sendMessage only reaches content scripts (of which there are
// none). runtime.sendMessage broadcasts to every extension context, including
// the dashboard page (new tab override), which listens on
// chrome.runtime.onMessage. If no dashboard tab is open the promise simply
// rejects and we ignore it.
chrome.commands.onCommand.addListener((command) => {
  chrome.runtime.sendMessage({ type: 'slax-hotkey', command }).catch(() => {});
});
chrome.runtime.onMessage.addListener((message,sender)=>{
  if(message.type!=='slax-web-playback' || !sender.tab || !/^https:\/\/(music\.youtube\.com|www\.youtube\.com|music\.apple\.com)\//.test(sender.url||''))return;
  chrome.runtime.sendMessage(message).catch(()=>{});
});

const suggestionCache=new Map(),suggestionRequests=new Map();
chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
  if(message?.type!=='slax-search-suggestions')return;
  if((sender.id && sender.id!==chrome.runtime.id) || typeof message.query!=='string'){sendResponse([]);return;}
  const query=message.query.trim().slice(0,200);
  if(query.length<2){sendResponse([]);return;}
  const language=['it','en','es','fr','de'].includes(message.language)?message.language:'en';
  const key=language+':'+query,owner=sender.documentId||sender.tab?.id||sender.url||'dashboard';
  suggestionRequests.get(owner)?.abort();
  const cached=suggestionCache.get(key);
  if(cached&&cached.expires>Date.now()){sendResponse(cached.items);return;}
  const controller=new AbortController();suggestionRequests.set(owner,controller);
  const timeout=setTimeout(()=>controller.abort(),4000);
  fetch('https://suggestqueries.google.com/complete/search?'+new URLSearchParams({client:'firefox',hl:language,q:query}),{signal:controller.signal})
    .then(response=>{if(!response.ok)throw Error('Suggestions unavailable');return response.json();})
    .then(data=>{
      const items=Array.isArray(data?.[1])?[...new Set(data[1].filter(item=>typeof item==='string'&&item.length<300))].slice(0,8):[];
      if(suggestionCache.size>=100)suggestionCache.delete(suggestionCache.keys().next().value);
      suggestionCache.set(key,{items,expires:Date.now()+300000});sendResponse(items);
    }).catch(()=>sendResponse([])).finally(()=>{clearTimeout(timeout);if(suggestionRequests.get(owner)===controller)suggestionRequests.delete(owner);});
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'slax-get-instagram-session') return;
  if (sender.id !== chrome.runtime.id) { sendResponse(null); return; }
  if (!chrome.cookies?.get) { sendResponse(null); return; }
  chrome.cookies.get({ url: 'https://www.instagram.com', name: 'sessionid' })
    .then(cookie => {
      sendResponse(cookie?.value ? `sessionid=${cookie.value}` : null);
    })
    .catch(() => sendResponse(null));
  return true;
});

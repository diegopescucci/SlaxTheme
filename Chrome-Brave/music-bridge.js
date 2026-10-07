// Read playback from the selected music service; no credentials or page state.
(()=>{
  const provider=location.hostname.includes('youtube.com')?'youtube':'apple';
  const read=selector=>document.querySelector(selector)?.textContent?.trim()||'';
  const publish=()=>{
    const media=[...document.querySelectorAll('video,audio')].find(item=>Number.isFinite(item.duration)&&item.duration>0);
    if(!media)return;
    const metadata=navigator.mediaSession?.metadata;
    let title=metadata?.title||read(provider==='youtube'?'ytmusic-player-bar .title':'[data-testid="track-title"]');
    let artist=metadata?.artist||read(provider==='youtube'?'ytmusic-player-bar .byline a':'[data-testid="track-subtitle"]');
    if(location.hostname==='www.youtube.com'){
      title=title||read('ytd-watch-metadata h1');
      artist=artist||read('ytd-video-owner-renderer #channel-name a');
      const split=title.match(/^(.+?)\s+[–-]\s+(.+)$/);
      if(split){artist=split[1];title=split[2].replace(/\s*[([](?:official.*?|lyrics?|video.*?)[)\]]/gi,'').trim();}
    }
    if(!title||!artist)return;
    const artUrl=metadata?.artwork?.[0]?.src||document.querySelector('ytmusic-player-bar img')?.src||'';
    chrome.runtime.sendMessage({type:'slax-web-playback',provider,title,artist,artUrl,time:media.currentTime,duration:media.duration,playing:!media.paused&&!media.ended}).catch(()=>{});
  };
  setInterval(publish,1000);
  for(const name of ['play','pause','seeked','ended'])document.addEventListener(name,publish,true);
})();

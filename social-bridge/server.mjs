import http from 'node:http';
import {createRequire} from 'node:module';
import {normalizeInstagram,normalizeTikTok,validUsername} from './profiles.mjs';
const require=createRequire(import.meta.url);
const instagram=require('instatouch'),tiktok=require('tiktok-scraper');
const cache=new Map(),pending=new Map();
const allowedOrigin=origin=>!origin || /^chrome-extension:\/\/[a-z]{32}$/.test(origin) || /^moz-extension:\/\/[a-f0-9-]{36}$/.test(origin) || /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);
async function tiktokProfile(username) {
    try {
        const profile=normalizeTikTok(await tiktok.getUserProfileInfo(username,{timeout:10000,download:false}));
        if(profile)return profile;
    } catch {}
    const response=await fetch(`https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(username)}`,{signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error(`TikTok returned ${response.status}`);
    const data=await response.json();
    if(data.code!==0)throw new Error('TikTok profile unavailable');
    return normalizeTikTok(data.data);
}
async function instagramProfile(username, session) {
    if (session) {
        try {
            const response=await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,{
                headers:{'Cookie':session,'X-IG-App-ID':'936619743392459','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36'},
                signal:AbortSignal.timeout(10000)
            });
            if(response.ok){
                const profile=normalizeInstagram(await response.json());
                if(profile)return {...profile,source:'Instagram Web API'};
            }
        } catch(error) {
            console.warn(`[bridge] Instagram Web API failed for ${username}:`,error?.message || error);
        }
    }
    // InstaTouch's timeout option delays a successful response; it does not
    // limit the network request. The server's request deadline handles that.
    return normalizeInstagram(await instagram.getUserMeta(username,{download:false,filetype:'na',...(session?{session}:{})}));
}
const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{
    const origin=req.headers.origin;
    if(!allowedOrigin(origin))return reply(res,403,{error:'Origin not allowed'});
    if(origin){
        res.setHeader('Access-Control-Allow-Origin',origin);
        res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Instagram-Session');
        res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');
    }
    res.setHeader('Vary','Origin');
    if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
    if(req.method!=='GET')return reply(res,405,{error:'GET required'});
    const url=new URL(req.url,'http://127.0.0.1:5191');
    if(url.pathname==='/health')return reply(res,200,{ok:true,providers:['instatouch','tiktok-scraper']});
    const match=url.pathname.match(/^\/profile\/(instagram|tiktok)\/([^/]+)$/);
    if(!match || !validUsername(match[2]))return reply(res,400,{error:'Invalid profile'});
    const [,platform,username]=match;
    const sessionHeader=req.headers['x-instagram-session'];
    const activeSession=sessionHeader || process.env.SLAX_INSTAGRAM_SESSION || '';
    const key=platform+':'+username.toLowerCase()+':'+(platform==='instagram'&&activeSession?'authenticated':'public');
    const cached=cache.get(key);
    if(cached && Date.now()-cached.at<300000)return reply(res,200,cached.profile);
    console.log(`[bridge] Request for ${platform}: ${username} (hasSession: ${Boolean(activeSession)})`);
    if(!pending.has(key)){
        const request=(async()=>{
            const profile=platform==='instagram'
                ?await instagramProfile(username,activeSession)
                :await tiktokProfile(username);
            if(!profile)throw new Error('No profile statistics returned');
            cache.set(key,{at:Date.now(),profile});return profile;
        })();
        pending.set(key,request);
        request.catch(err=>console.error(`[bridge] Error scraping ${platform}/${username}:`, err?.message || err));
        request.finally(()=>pending.delete(key)).catch(()=>{});
    }
    let timer;
    try {
        const profile=await Promise.race([pending.get(key),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Scraper timeout')),14000);})]);
        reply(res,200,profile);
    }catch(err) {
        console.error(`[bridge] Failed request for ${platform}/${username}:`, err?.message || err);
        reply(res,502,{error:platform==='instagram'?'Instagram unavailable. Log in to Instagram in this browser and retry.':'TikTok unavailable. Check the username and retry later.'});
    }
    finally {clearTimeout(timer);}
});
server.listen(5191,'127.0.0.1',()=>console.log('Slax social bridge ready at http://127.0.0.1:5191'));

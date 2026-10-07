const count=value=>{const number=Number(value);return Number.isFinite(number)&&number>=0?number:null;};
export function normalizeInstagram(raw) {
    const user=raw?.graphql?.user || raw?.data?.user || raw?.user || raw;
    const followers=count(user?.edge_followed_by?.count ?? user?.follower_count ?? user?.followers);
    if(followers===null)return null;
    return {followers,following:count(user?.edge_follow?.count ?? user?.following_count ?? user?.following)??-1,posts:count(user?.edge_owner_to_timeline_media?.count ?? user?.media_count ?? user?.posts)??-1,source:'drawrowfly · InstaTouch'};
}
export function normalizeTikTok(raw) {
    const profile=raw?.userInfo || raw;
    const user=profile?.user || profile;
    const stats=profile?.stats || profile;
    const followers=count(stats?.followerCount ?? stats?.fans ?? stats?.followers);
    if(followers===null)return null;
    return {followers,following:count(stats?.followingCount ?? stats?.following)??-1,likes:count(stats?.heartCount ?? stats?.heart)??0,videos:count(stats?.videoCount ?? stats?.video)??-1,uniqueId:user?.uniqueId || '',source:'drawrowfly · TikTok Scraper'};
}
export const validUsername=value=>typeof value==='string'&&/^[a-zA-Z0-9._]{1,30}$/.test(value);

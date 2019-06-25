const path1 = "/groups/timeline";
const path2 = "/statuses/unread";
const path3 = "/statuses/extend";
const path4 = "/comments/build_comments";
const path5 = "/photo/recommend_list";
const path6 = "/stories/video_stream";
const path7 = "/statuses/positives/get";
const path8 = "/stories/home_list";
const path9 = "/profile/statuses";
const path10 = "/statuses/friends/timeline";
const path11 = "/service/picfeed";

const url = $request.url;
var body = $response.body;
function filter_timeline() {
    let obj = JSON.parse(body);
    let statuses = obj.statuses;
    if (statuses && statuses.length > 0) {
        let i = statuses.length;
        while (i--) {
            let element = statuses[i];
            if (is_timeline_likerecommend(element.title)) statuses.splice(i, 1);
            if(is_timeline_ad(element.promotion)) statuses.splice(i, 1);
        }
        if (obj.advertises) obj.advertises = [];
        if (obj.ad) obj.ad = [];
        if (obj.num) obj.num = obj.original_num;
    }
    if (obj.trends) obj.trends = [];
    body = JSON.stringify(obj);
}

function is_timeline_ad(promotion) {
    return (promotion && promotion.type && promotion.type == "ad") ? true : false;
}

function is_timeline_likerecommend(title) {
    return (title && title.type && title.type == "likerecommend") ? true : false;
}

function filter_comments(datas) {
    if (datas && datas.length > 0) {
        let i = datas.length;
        while (i--) {
            const element = datas[i];
            let type = element.type;
            if (type == 5 || type == 1 || type == 6) datas.splice(i, 1);
        }
    }
    return datas;
}

if (url.indexOf(path1) != -1) {
    filter_timeline();
}

if (url.indexOf(path2) != -1) {
    filter_timeline();
}

if (url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    if (obj.trend) delete obj.trend;
    body = JSON.stringify(obj);
}

if (url.indexOf(path4) != -1) {
    let obj = JSON.parse(body);
    obj.recommend_max_id = 0;
    if (obj.status) {
        if (obj.top_hot_structs) {
            obj.max_id = obj.top_hot_structs.call_back_struct.max_id;
            delete obj.top_hot_structs;
        }
        if (obj.datas) obj.datas = filter_comments(obj.datas);
    } else {
        obj.datas = [];
    }
    body = JSON.stringify(obj);
}

if (url.indexOf(path5) != -1) {
    let obj = JSON.parse(body);
    obj.data = {};
    body = JSON.stringify(obj);
}

if (url.indexOf(path6) != -1) {
    let obj = JSON.parse(body);
    let segments = obj.segments;
    if (segments && segments.length > 0) {
        let i = segments.length;
        while (i--) {
            const element = segments[i];
            let is_ad = element.is_ad;
            if (typeof is_ad != "undefined" && is_ad == true) segments.splice(i, 1);
        }
    }
    body = JSON.stringify(obj);
}

if (url.indexOf(path7) != -1) {
    let obj = JSON.parse(body);
    obj.datas = [];
    body = JSON.stringify(obj);
}

if (url.indexOf(path8) != -1) {
    let obj = JSON.parse(body);
    obj.story_list = [];
    body = JSON.stringify(obj);
}

if (url.indexOf(path9) != -1) {
    let obj = JSON.parse(body);
    let cards = obj.cards;
    if (cards && cards.length > 0) {
        let i = cards.length;
        while (i--) {
            let element = cards[i];
            let card_group = element.card_group;
            if (card_group && card_group.length > 0) cards.splice(i, 1);
        }
    }
    body = JSON.stringify(obj);
}

if (url.indexOf(path10) != -1) {
    filter_timeline();
}

if (url.indexOf(path11) != -1) {
    let obj = JSON.parse(body);
    obj.data = [];
    body = JSON.stringify(obj);
}
$done({body});

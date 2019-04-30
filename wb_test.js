/*
 * @repo: https://github.com/yichahucha/surge
 * @script: https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js
 */

const path1 = "/groups/timeline";
const path2 = "/statuses/unread";
const path3 = "/statuses/extend";
const path4 = "/comments/build_comments";
const path5 = "/photo/recommend_list";
const path6 = "/stories/video_stream";
const path7 = "/statuses/positives/get";
var result = body;
function is_likerecommend(title) {
    if (title && title.type && title.type == "likerecommend") {
        return true;
    } else {
        return false;
    }
}
function filter_timeline() {
    let json_body = JSON.parse(body);
    let ad = json_body.ad;
    let statuses = json_body.statuses;
    if (statuses && statuses.length > 0 && ad && ad.length > 0) {
        for (let i = 0; i < ad.length; i++) {
            const element = ad[i];
            let ad_id = element.id;
            for (let j = 0; j < statuses.length; j++) {
                const element = statuses[j];
                let statuses_id = element.id;
                if (statuses_id == parseInt(ad_id)) {
                    statuses.splice(j, 1);
                    break;
                }
            }
        }
    }
    if (statuses && statuses.length > 0) {
        let new_statuses = [];
        for (let i = 0; i < statuses.length; i++) {
            const element = statuses[i];
            if (!is_likerecommend(element.title)) {
                new_statuses.push(element);
            }
        }
        json_body.statuses = new_statuses;
    }
    if (json_body.num) {
        json_body.num = json_body.statuses.length;
        json_body.original_num = json_body.statuses.length;
    }
    if (json_body.trends) {
        json_body.trends = [];
    }
    result = JSON.stringify(json_body);
}
if (url.indexOf(path1) != -1) {
    filter_timeline();
}
if (url.indexOf(path2) != -1) {
    filter_timeline();
}
if (url.indexOf(path3) != -1) {
    let json_body = JSON.parse(body);
    delete json_body.trend;
    result = JSON.stringify(json_body);
}
if (url.indexOf(path4) != -1) {
    let json_body = JSON.parse(body);
    let datas = json_body.datas;
    if (datas && datas.length > 0) {
        let new_datas = [];
        for (let j = 0; j < datas.length; j++) {
            const element = datas[j];
            let type = element.type;
            if (type != 5 && type != 1 && type != 6) {
                new_datas.push(element);
            }
        }
        json_body.datas = new_datas;
    }
    result = JSON.stringify(json_body);
}
if (url.indexOf(path5) != -1) {
    let json_body = JSON.parse(body);
    json_body.data = {};
    result = JSON.stringify(json_body);
}
if (url.indexOf(path6) != -1) {
    let json_body = JSON.parse(body);
    let segments = json_body.segments;
    let new_segments = [];
    for (let j = 0; j < segments.length; j++) {
        const element = segments[j];
        let is_ad = element.is_ad;
        if (typeof is_ad == "undefined" || is_ad == false) {
            new_segments.push(element);
        }
    }
    json_body.segments = new_segments;
    result = JSON.stringify(json_body);
}
if (url.indexOf(path7) != -1) {
    let json_body = JSON.parse(body);
    json_body.datas = [];
    result = JSON.stringify(json_body);
}
result;

let path2 = '/statuses/';//feed流广告
let path3 = '/statuses/extend';//详情中的广告共享计划、相关推荐
let path4 = '/comments/build_comments';//评论中的相关内容、推荐
let path5 = '/photo/recommend_list';//相关图集屏蔽
var result = body;
if (url.indexOf(path2) != -1) {
    var json_body = JSON.parse(body);
    if (url.indexOf(path3) != -1) { 
        delete json_body.trend
    }else {
        var ad = json_body.ad;
        if (typeof(ad) != "undefined") {
            var statuses = json_body.statuses;
            for (let i = 0; i < ad.length; i++) {
                const element = ad[i];
                let ad_id = element.id;
                for (let j = 0; j < statuses.length; j++) {
                    const element = statuses[j];
                    let statuses_id = element.id;
                    if (statuses_id == parseInt(ad_id)) {
                        statuses.splice(j,1);
                    }
                }
            }
        }
    }
    result = JSON.stringify(json_body);
}
if (url.indexOf(path4) != -1) { 
    var json_body = JSON.parse(body);
    var datas = json_body.datas;
    var new_datas = []
    for (let j = 0; j < datas.length; j++) {
        const element = datas[j];
        let type = element.type;
        if (type!=5 && type!=1 && type!=6) {
            new_datas.push(element);
        }
    }
    json_body.datas = new_datas;
    result = JSON.stringify(json_body);
}
if (url.indexOf(path5) != -1) { 
    var json_body = JSON.parse(body);
    json_body.data = {};
    result = JSON.stringify(json_body);
}
result;

let path2 = '/2/statuses/';//Feed流广告
let path3 = '/2/statuses/extend';//微博创作者广告共享计划、相关推荐
var result = body;
if (url.indexOf(path2) != -1) {
    var json_body = JSON.parse(body)
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
result;

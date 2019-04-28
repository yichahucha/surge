let path1 = '/interface/sdk/sdkad.php';//启动页广告
let path2 = '/2/statuses/';//Feed流广告
let path3 = '/2/statuses/extend';//微博创作者广告共享计划

var result = body;
if (url.indexOf(path1) != -1) {
    var json_body = JSON.parse(body)
    json_body.needlocation = false;
    json_body.show_push_splash_ad = false;
    json_body.ads = [];
    result = JSON.stringify(json_body);
    console.log('启动页广告');
} 

if (url.indexOf(path2) != -1) {
    var json_body = JSON.parse(body)
    if (url.indexOf(path3) != -1) { 
        delete json_body.trend;
        console.log('共享计划广告');
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
        console.log('Feed流广告');
    }
    result = JSON.stringify(json_body);
}
result;

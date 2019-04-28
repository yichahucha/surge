let path1 = '/interface/sdk/sdkad.php';
let path2 = '/2/statuses/';
var result = body;
if (url.indexOf(path1) != -1) {
    var json_body = JSON.parse(body)
    json_body.needlocation = false;
    json_body.show_push_splash_ad = false;
    json_body.ads = [];
    result = JSON.stringify(json_body);
    console.log('去启动页广告');
} 

if (url.indexOf(path2) != -1) {
    var json_body = JSON.parse(body)
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
    result = JSON.stringify(json_body);
    console.log('去应用呢广告');
}
result;

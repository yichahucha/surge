var path1 = '/interface/sdk/sdkad.php';
var result = JSON.parse(body)
if (url.indexOf(path1) != -1) {
    result.needlocation = false;
    result.show_push_splash_ad = false;
    result.ads = [];
    console.log('去启动页广告')
} else {
    var ad = result.ad;
    var statuses = result.statuses;
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
JSON.stringify(result)

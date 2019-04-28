var result = JSON.parse(body)
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
JSON.stringify(result)

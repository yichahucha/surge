/*
README：https://github.com/yichahucha/surge/tree/master
 */

const path1 = "serverConfig";
const path2 = "wareBusiness";
const console_log = false;
const url = $request.url;
const body = $response.body;

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);
    obj.serverConfig.httpdns = "0";
    obj.serverConfig.imageDNS = "0";
    obj.serverConfig.dnsvip = "";
    $done({ body: JSON.stringify(obj) });
    if (console_log) console.log("httpdns closed");
}

if (url.indexOf(path2) != -1) {
    let obj = JSON.parse(body);
    const floors = obj.floors;
    const commodity_info = floors[floors.length - 1];
    const shareUrl = commodity_info.data.property.shareUrl;
    request_hsitory_price(shareUrl, function (data) {
        if (data) {
            const lowerword = adword_obj();
            lowerword.data.ad.textColor = "#fe0000";
            let bestIndex = 0;
            for (let index = 0; index < floors.length; index++) {
                const element = floors[index];
                if (element.sortId > lowerword.sortId) {
                    bestIndex = index;
                    break;
                }
            }
            if (data.ok == 1 && data.single) {
                const price_msgs = history_price_msg(data.single)
                const historyword = adword_obj();
                lowerword.data.ad.adword = price_msgs[0];
                historyword.data.ad.adword = price_msgs[1];
                historyword.data.ad.textColor = "#FE9900";
                floors.insert(bestIndex, lowerword);
                floors.insert(bestIndex + 1, historyword);
            }
            if (data.ok == 0 && data.msg.length > 0) {
                lowerword.data.ad.adword = "⚠️ " + data.msg;
                floors.insert(bestIndex, lowerword);
            }
            $done({ body: JSON.stringify(obj) });
        } else {
            $done({ body });
        }
    })
}

function history_price_msg(data) {
    const list_str = data.jiagequshiyh + ","
    const list = list_str.split("],");
    const lower = data.lowerPriceyh;
    const lower_date = changeDateFormat(data.lowerDateyh);
    const lower_msg = "‼️ 历史最低到手价:   ¥" + String(lower) + "   " + lower_date
    const curret_msg = (data.currentPriceStatus ? "   当前价格" + data.currentPriceStatus : "") + "   (仅供参考)";
    const riqi = "日期：";
    const jiage = "价格：";
    const youhui = "活动：";
    const title_msg = "〽️ 历史价格走势\n\n" + riqi + get_blank_space(25 - riqi.length) + jiage + get_blank_space(25 - jiage.length) + youhui;
    const lower_price_msg = lower_msg + curret_msg;
    let history_price_msg = title_msg + "\n";
    list.reverse().slice(0, 180).forEach(item => {
        if (item.length > 0) {
            const rex = /\[(.*),(.*?),"(.*)"/;
            const result = rex.exec(item);
            const dateUTC = new Date(eval(result[1]));
            const date = dateUTC.format("yyyy-MM-dd");
            let price = result[2];
            price = "¥" + String(parseFloat(price));
            if (date == lower_date) {
                price += "❗️"
            }
            const sale = result[3];
            const msg = date + get_blank_space(22 - date.length) + price + get_blank_space(15 - price.length) + sale + "\n";
            history_price_msg += msg;
        }
    });
    return [lower_price_msg, history_price_msg];
}

function request_hsitory_price(share_url, callback) {
    const options = {
        url: "https://apapia-history.manmanbuy.com/ChromeWidgetServices/WidgetServices.ashx",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios"
        },
        body: "methodName=getBiJiaInfo_wxsmall&p_url=" + encodeURIComponent(share_url)
    }
    $httpClient.post(options, function (error, response, data) {
        if (!error) {
            callback(JSON.parse(data));
            if (console_log) console.log("Data:\n" + data);
        } else {
            callback(null, null);
            if (console_log) console.log("Error:\n" + error);
        }
    })
}

function changeDateFormat(cellval) {
    const date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));
    const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    const currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return date.getFullYear() + "-" + month + "-" + currentDate;
}

function get_blank_space(length) {
    let blank = "";
    for (let index = 0; index < length; index++) {
        blank += " ";
    }
    return blank;
}

function adword_obj() {
    return {
        "bId": "eCustom_flo_199",
        "cf": {
            "bgc": "#ffffff",
            "spl": "empty"
        },
        "data": {
            "ad": {
                "adword": "",
                "textColor": "#8C8C8C",
                "color": "#f23030",
                "newALContent": true,
                "hasFold": true,
                "class": "com.jd.app.server.warecoresoa.domain.AdWordInfo.AdWordInfo",
                "adLinkContent": "",
                "adLink": ""
            }
        },
        "mId": "bpAdword",
        "refId": "eAdword_0000000028",
        "sortId": 12
    }
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

Date.prototype.format = function (fmt) {
    var o = {
        "y+": this.getFullYear(),
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            if (k == "y+") {
                fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
            }
            else if (k == "S+") {
                var lens = RegExp.$1.length;
                lens = lens == 1 ? 3 : lens;
                fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1, lens));
            }
            else {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
    }
    return fmt;
}

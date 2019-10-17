/*
[Script]
http-response ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) script-path=jd_history_price.js,requires-body=1

[MITM]
hostname = api.m.jd.com
 */

const path1 = "serverConfig";
const path2 = "wareBusiness";
const console_log = true;
const url = $request.url;
var body = $response.body;

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);
    obj.serverConfig.httpdns = 0;
    body = JSON.stringify(obj);
    if (console_log) console.log("httpdns closed");
    $done({ body });
}

if (url.indexOf(path2) != -1) {
    let obj = JSON.parse(body);
    let floors = obj.floors;
    let commodity_info = floors[floors.length - 1];
    // let name = commodity_info.data.wareInfo.name;
    let shareUrl = commodity_info.data.property.shareUrl;
    request_hsitory_price(shareUrl, function (data) {
        if (data) {
            let lowerword = adword_obj();
            let historyword = adword_obj();
            let price_msgs = history_price_msg(data.single)
            lowerword.data.ad.adword = price_msgs[0];
            lowerword.data.ad.textColor = "#f23030";
            historyword.data.ad.adword = price_msgs[1];
            historyword.data.ad.textColor = "#D2B48C";
            let bestIndex = 0;
            for (let index = 0; index < floors.length; index++) {
                const element = floors[index];
                if (element.sortId > lowerword.sortId) {
                    bestIndex = index;
                    break;
                }
            }
            floors.insert(bestIndex, lowerword);
            floors.insert(bestIndex + 1, historyword);
            body = JSON.stringify(obj);
            $done({ body });
        } else {
            $done({ body });
        }
    })
}

function history_price_msg(data) {
    let list_str = data.jiagequshiyh + ","
    let list = list_str.split("],");
    let lower = data.lowerPriceyh;
    let lower_msg = "⚠️ 历史最低到手价:   ¥" + String(lower) + "   " + changeDateFormat(data.lowerDateyh)
    let curret_msg = data.currentPriceStatus ? "   当前价格" + data.currentPriceStatus : "" + "   仅供参考";
    let riqi = "日期：";
    let jiage = "价格：";
    let youhui = "活动：";
    let title_msg = "📈 价格走势\n\n" + riqi + get_blank_space(25 - riqi.length) + jiage + get_blank_space(25 - jiage.length) + youhui;
    let lower_price_msg = lower_msg + curret_msg;
    let history_price_msg = title_msg + "\n";
    list.reverse().slice(0, 180).forEach(item => {
        if (item.length > 0) {
            let rex = /\[(.*),(.*?),"(.*)"/;
            let result = rex.exec(item);
            let dateUTC = new Date(eval(result[1]));
            let date = dateUTC.format("yyyy-MM-dd");
            let price = result[2];
            if (price * 1 == lower) {
                price += "";
            } else if (price * 1 > lower) {
                price += "";
            } else {
                price += "";
            }
            price = "¥" + String(parseFloat(price));
            let sale = result[3];
            let msg = date + get_blank_space(24 - date.length) + price + get_blank_space(15 - price.length) + sale + "\n";
            history_price_msg += msg;
        }
    });
    return [lower_price_msg, history_price_msg];
}

function request_hsitory_price(share_url, callback) {
    let options = {
        url: "https://apapia-history.manmanbuy.com/ChromeWidgetServices/WidgetServices.ashx",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios"
        },
        body: "methodName=getBiJiaInfo_wxsmall&p_url=" + encodeURIComponent(share_url)
    }
    $httpClient.post(options, function (error, response, data) {
        if (!error) {
            if (console_log) console.log("Data:\n" + data);
            let obj = JSON.parse(data);
            if (obj.ok == 1 && obj.single) {
                callback(obj);
            } else {
                callback(null);
            }
        } else {
            callback(null);
            if (console_log) console.log("Error:\n" + error);
        }
    })
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

function changeDateFormat(cellval) {
    var date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
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

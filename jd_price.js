

const path1 = "serverConfig";
const path2 = "wareBusiness";
const path3 = "basicConfig";
const consolelog = false;
const url = $request.url;
const body = $response.body;
const $tool = tool();

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);
    delete obj.serverConfig.httpdns;
    delete obj.serverConfig.dnsvip;
    delete obj.serverConfig.dnsvip_v6;
    $done({ body: JSON.stringify(obj) });
}

if (url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    let JDHttpToolKit = obj.data.JDHttpToolKit;
    if (JDHttpToolKit) {
        delete obj.data.JDHttpToolKit.httpdns;
        delete obj.data.JDHttpToolKit.dnsvipV6;
    }
    $done({ body: JSON.stringify(obj) });
}

if (url.indexOf(path2) != -1) {
    let obj = JSON.parse(body);
    const floors = obj.floors;
    const commodity_info = floors[floors.length - 1];
    const shareUrl = commodity_info.data.property.shareUrl;
    request_history_price(shareUrl, function (data) {
        if (data) {
            const lowerword = adword_obj();
            lowerword.data.ad.textColor = "#fe0000";
            let bestIndex = 0;
            for (let index = 0; index < floors.length; index++) {
                const element = floors[index];
                if (element.mId == lowerword.mId) {
                    bestIndex = index + 1;
                    break;
                } else {
                    if (element.sortId > lowerword.sortId) {
                        bestIndex = index;
                        break;
                    }
                }
            }
            if (data.ok == 1 && data.single) {
                const detail = priceSummary(data)
                lowerword.data.ad.adword = `${detail}`;
                floors.insert(bestIndex, lowerword);
            }
            if (data.ok == 0 && data.msg.length > 0) {
                lowerword.data.ad.adword = "暂无价格信息";
                floors.insert(bestIndex, lowerword);
            }
            $done({ body: JSON.stringify(obj) });
        } else {
            $done({ body });
        }
    })
}

function priceSummary(data) {
    let summary = ""
    let listPriceDetail = data.PriceRemark.ListPriceDetail
    listPriceDetail.forEach((item, index) => {
        if (item.Name.indexOf("11") != -1) {
            item.Name += getSpace(6)
        } else if (item.Name.indexOf("618") != -1) {
            item.Name += getSpace(7)
        } else if (item.Name.indexOf("30") != -1) {
            item.Name += getSpace(2)
        } else if (item.Name.indexOf("当前") != -1) {
            item.Name += getSpace(3)
        } else if (item.Name.indexOf("历史") != -1) {
            item.Name += getSpace(3)
        }
        summary += `\n${item.Name}${getSpace(6)}${item.Price}${getSpace(6)}${item.Date}${getSpace(6)}${item.Difference}`
    })
    return summary
}

function request_history_price(share_url, callback) {
    const options = {
        url: "https://apapia-history.manmanbuy.com/ChromeWidgetServices/WidgetServices.ashx",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios"
        },
        body: "methodName=getHistoryTrend&p_url=" + encodeURIComponent(share_url)
    }
    $tool.post(options, function (error, response, data) {
        if (!error) {
            callback(JSON.parse(data));
            if (consolelog) console.log("Data:\n" + data);
        } else {
            callback(null, null);
            if (consolelog) console.log("Error:\n" + error);
        }
    })
}

function dateFormat(cellval) {
    const date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));
    const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    const currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return date.getFullYear() + "-" + month + "-" + currentDate;
}

function getSpace(length) {
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
        "sortId": 13
    }
}

function tool() {
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const isResponse = typeof $response != "undefined"
    const node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
        if (node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    const write = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const read = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const adapterStatus = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
    const get = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.get(options, (error, response, body) => {
            callback(error, adapterStatus(response), body)
        })
        if (node) {
            node.request(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
    }
    const post = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) {
            $httpClient.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (node) {
            node.request.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
    }
    return { isQuanX, isSurge, isResponse, notify, write, read, get, post }
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

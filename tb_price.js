/*
README：https://github.com/yichahucha/surge/tree/master
 */

const $tool = new Tool()
const path1 = "/amdc/mobileDispatch"
const path2 = "/gw/mtop.taobao.detail.getdetail"
const consoleLog = false
const url = $request.url

if (url.indexOf(path1) != -1) {
    if ($tool.isResponse) {
        const $base64 = new Base64()
        let body = $response.body
        let obj = JSON.parse($base64.decode(body))
        let dns = obj.dns
        if (dns && dns.length > 0) {
            let i = dns.length;
            while (i--) {
                const element = dns[i];
                let host = "trade-acs.m.taobao.com"
                if (element.host == host) {
                    element.ips = []
                    if (consoleLog) console.log(JSON.stringify(element))
                }
            }
        }
        body = $base64.encode(JSON.stringify(obj))
        $done({ body })
    } else {
        let headers = $request.headers
        let body = $request.body
        if (headers["User-Agent"].indexOf("%E6%89%8B%E6%9C%BA%E6%B7%98%E5%AE%9D") != -1) {
            let json = Qs2Json(body)
            let domain = json.domain.split(" ")
            let i = domain.length;
            while (i--) {
                const block = "trade-acs.m.taobao.com"
                const element = domain[i];
                if (element == block) {
                    domain.splice(i, 1);
                }
            }
            json.domain = domain.join(" ")
            body = Json2Qs(json)
        }
        $done({ body })
    }
}

if (url.indexOf(path2) != -1) {
    const body = $response.body
    let obj = JSON.parse(body)
    let item = obj.data.item
    let shareUrl = `https://item.taobao.com/item.htm?id=${item.itemId}`
    requestPrice(shareUrl, function (data) {
        if (data) {
            if (obj.data.apiStack) {
                let apiStack = obj.data.apiStack[0]
                let value = JSON.parse(apiStack.value)
                let tradeConsumerProtection = null
                let consumerProtection = null
                let trade = null
                let vertical = null
                if (value.global) {
                    tradeConsumerProtection = value.global.data.tradeConsumerProtection
                    consumerProtection = value.global.data.consumerProtection
                    trade = value.global.data.trade
                    vertical = value.global.data.vertical
                } else {
                    tradeConsumerProtection = value.tradeConsumerProtection
                    consumerProtection = value.consumerProtection
                    trade = value.trade
                    vertical = value.vertical
                }
                if (trade && trade.useWap == "true") {
                    $done({ body })
                    sendNotify(data, shareUrl)
                } else {
                    if (vertical && vertical.hasOwnProperty("tmallhkDirectSale")) {
                        $done({ body })
                        sendNotify(data, shareUrl)
                    } else if (tradeConsumerProtection) {
                        tradeConsumerProtection = setTradeConsumerProtection(data, tradeConsumerProtection)
                    } else {
                        consumerProtection = setConsumerProtection(data, consumerProtection)
                    }
                    apiStack.value = JSON.stringify(value)
                    $done({ body: JSON.stringify(obj) })
                }
            } else {
                $done({ body })
                sendNotify(data, shareUrl)
            }
        } else {
            $done({ body })
        }
    })
}

function sendNotify(data, shareUrl) {
    if (data.ok == 1 && data.single) {
        const detail = priceSummary(data)[1]
        $tool.notify("", "", detail)
    }
    if (data.ok == 0 && data.msg.length > 0) {
        $tool.notify("", "", `暂无历史价格`)
    }
}

function setConsumerProtection(data, consumerProtection) {
    let basicService = consumerProtection.serviceProtection.basicService
    let items = consumerProtection.items
    if (data.ok == 1 && data.single) {
        const lower = lowerMsgs(data.single)
        const summary = priceSummary(data)[1]
        const item = customItem(lower, [summary])
        basicService.services.unshift(item)
        items.unshift(item)
    }
    if (data.ok == 0 && data.msg.length > 0) {
        let item = customItem("暂无历史价格", "")
        basicService.services.unshift(item)
        items.unshift(item)
    }
    return consumerProtection
}

function setTradeConsumerProtection(data, tradeConsumerProtection) {
    let service = tradeConsumerProtection.tradeConsumerService.service
    if (data.ok == 1 && data.single) {
        const lower = lowerMsgs(data.single)
        // const tbitems = priceSummary(data)[0]
        // const item = customItem(lower, "")
        // let nonService = tradeConsumerProtection.tradeConsumerService.nonService
        // service.items = service.items.concat(nonService.items)
        // nonService.title = "历史价格详情"
        // nonService.items = tbitems
        const summary = priceSummary(data)[1]
        const item = customItem(lower, [summary])
        service.items.unshift(item)
    }
    if (data.ok == 0 && data.msg.length > 0) {
        service.items.unshift(customItem("暂无历史价格", ""))
    }
    return tradeConsumerProtection
}

function lowerMsgs(data) {
    const lower = data.lowerPriceyh
    const lowerMsg1 = "历史最低 ¥" + String(lower)
    return lowerMsg1
}

function priceSummary(data) {
    let tbitems = []
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
        summary += `\n${item.Name}${getSpace(4)}${item.Price}${getSpace(4)}${item.Date}${getSpace(4)}${item.Difference}`
        let summaryItem = `${item.Name}${getSpace(4)}${item.Price}${getSpace(4)}${item.Date}${getSpace(4)}${item.Difference}`
        tbitems.push(customItem(summaryItem))
    })
    return [tbitems, summary]
}

function requestPrice(share_url, callback) {
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
            if (consoleLog) console.log("Data:\n" + data);
        } else {
            callback(null, null);
            if (consoleLog) console.log("Error:\n" + error);
        }
    })
}

function getSpace(length) {
    let blank = "";
    for (let index = 0; index < length; index++) {
        blank += " ";
    }
    return blank;
}

function customItem(title, desc) {
    return {
        icon: "https://s2.ax1x.com/2020/02/16/3STeIJ.png",
        title: title,
        name: title,
        desc: desc
    }
}

function Qs2Json(url) {
    var search = url.substring(url.lastIndexOf("?") + 1);
    var obj = {};
    var reg = /([^?&=]+)=([^?&=]*)/g;
    search.replace(reg, function (rs, $1, $2) {
        var name = decodeURIComponent($1);
        var val = decodeURIComponent($2);
        val = String(val);
        obj[name] = val;
        return rs;
    });
    return obj;
}

function Json2Qs(json) {
    var temp = [];
    for (var k in json) {
        temp.push(k + "=" + json[k]);
    }
    return temp.join("&");
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

function Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.get(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.post(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request.post(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    _status = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}

function Base64() {
    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }
    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }
    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }
    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}
/**
 * 脚本管理工具（QuanX 举例）
 * 
 * 一.设置定时任务更新脚本，第一次运行需要手动执行一下更新脚本（Qanx 普通调试模式容易更新失败，使用最新 TF 橙色按钮调试），例如设置每天凌晨更新脚本：
 * [task_local]
 * 0 0 * * * eval_script.js
 * 
 * 二.__conf 配置说明：
 * 
 * 参考下面 __conf 示例
 * 
 * [远程配置]
 * 参考示例：https://raw.githubusercontent.com/yichahucha/surge/master/sub_script.conf
 * 
 * [本地配置]
 * jd 脚本举例
 * 1.添加配置，格式为：匹配脚本对应的正则1 匹配脚本对应的正则2 eval 远程脚本的链接
 * [local]
 * ^https?://api\.m\.jd\.com/client\.action\？functionId=(wareBusiness|serverConfig) eval https://raw.githubusercontent.com/yichahucha/surge/master/jd_price.js
 *
 * 2.修改配置文件原脚本路径为 eval_script.js 的脚本路径
 * [rewrite_local]
 * #^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) url script-response-body jd_price.js
 * ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) url script-response-body eval_script.js
 * [mitm]
 * hostname = api.m.jd.com
 */

const __conf = String.raw`


[remote]
// custom remote...

https://raw.githubusercontent.com/yichahucha/surge/master/sub_script.conf


[local]
// custom local...


`

const __tool = new ____Tool()
const __isTask = __tool.isTask
const __log = false
const __debug = true
const __emoji = "🪓"
const __concurrencyLimit = 5

if (__isTask) {
    const ____getConf = (() => {
        return new Promise((resolve) => {
            const remoteConf = ____removeGarbage(____extractConf(__conf, "remote"))
            const localConf = ____removeGarbage(____extractConf(__conf, "local"))
            if (remoteConf.length > 0) {
                console.log("Start updating conf...")
                __tool.notify("", "", `Start updating ${remoteConf.length} confs...`)
                ____concurrentQueueLimit(remoteConf, __concurrencyLimit, (url) => {
                    return ____downloadFile(url)
                })
                    .then(result => {
                        console.log("Stop updating conf.")
                        let content = []
                        result.forEach(data => {
                            if (data.body) {
                                content = content.concat(____parseRemoteConf(data.body))
                            }
                        });
                        content = content.concat(localConf)
                        resolve({ content, result })
                    })
            } else {
                resolve({ content: localConf, result: [] })
            }
        })
    })

    const begin = new Date()
    ____getConf()
        .then((conf) => {
            return new Promise((resolve, reject) => {
                if (conf.content.length > 0) {
                    resolve(conf)
                } else {
                    reject(`Invalid configuration information! Please check!`)
                }
            })
        })
        .then((conf) => {
            const confContent = ____parseConf(conf.content)
            const confResult = conf.result
            const scriptUrls = Object.keys(confContent)
            console.log("Start updating script...")
            __tool.notify("", "", `Start updating ${scriptUrls.length} scripts...`)
            ____concurrentQueueLimit(scriptUrls, __concurrencyLimit, (url) => {
                return new Promise((resolve) => {
                    ____downloadFile(url).then((data) => {
                        if (data.code == 200) {
                            __tool.write(data.body, data.url)
                        }
                        resolve(data)
                    })
                })
            })
                .then(result => {
                    console.log("Stop updating script.")
                    __tool.write(JSON.stringify(confContent), "ScriptConfContentKey")
                    const resultInfo = (() => {
                        let message = ""
                        let success = 0
                        let fail = 0
                        confResult.concat(result).forEach(data => {
                            if (data.message.match("success")) success++
                            if (data.message.match("fail")) fail++
                            message += message.length > 0 ? "\n" + data.message : data.message
                        });
                        return { message, count: { success, fail } }
                    })()
                    return resultInfo
                })
                .then((resultInfo) => {
                    console.log(resultInfo.message)
                    let messages = resultInfo.message.split("\n")
                    let notifyMessage = `${messages.slice(0, 20).join("\n")}${messages.length > 20 ? `\n${__emoji}......\n` : ""}`
                    let lastDate = __tool.read("ScriptLastUpdateDateKey")
                    lastDate = lastDate ? lastDate : new Date().Format("yyyy-MM-dd HH:mm:ss")
                    __tool.notify("Update Done", `Success: ${resultInfo.count.success}   Fail: ${resultInfo.count.fail}   Tasks: ${____timeDiff(begin, new Date())}s`, `${notifyMessage}\n${lastDate} last update`)
                    __tool.write(new Date().Format("yyyy-MM-dd HH:mm:ss"), "ScriptLastUpdateDateKey")
                    $done()
                })
        })
        .catch((error) => {
            console.log(error)
            if (__debug) __tool.notify("", "", error)
            $done()
        })
}

if (!__isTask) {
    const __url = $request.url
    const __confObj = JSON.parse(__tool.read("ScriptConfContentKey"))
    const __script = (() => {
        let script = null
        for (let key in __confObj) {
            let value = __confObj[key]
            value.some((url) => {
                try {
                    if (__url.match(url)) {
                        script = { url: key, content: __tool.read(key), match: url }
                        return true
                    }
                } catch (error) {
                    __tool.notify("", "", `Regular Error: ${url}\nRequest URL: ${__url}`)
                    console.log(`${error}\nRegular Error: ${url}\nRequest URL: ${__url}`)
                }
            })
        }
        return script
    })()
    if (__script) {
        if (__script.content) {
            eval(__script.content)
            if (__log) console.log(`Request URL: ${__url}\nMatch URL: ${__script.match}\nExecute script: ${__script.url}`)
        } else {
            $done({})
            if (__log) console.log(`Request URL: ${__url}\nMatch URL: ${__script.match}\nScript not executed. Script not found: ${__script.url}`)
        }
    } else {
        $done({})
        if (__log) console.log(`No match URL: ${__url}`)
    }
}

function ____timeDiff(begin, end) {
    return Math.ceil((end.getTime() - begin.getTime()) / 1000)
}

async function ____sequenceQueue(urls) {
    let results = []
    for (let i = 0; i < urls.length; i++) {
        let result = await ____downloadFile(urls[i])
        results.push(result)
    }
    return results
}

function ____concurrentQueueLimit(list, limit, asyncHandle) {
    let results = []
    let recursion = (arr) => {
        return asyncHandle(arr.shift())
            .then((data) => {
                results.push(data)
                if (arr.length !== 0) return recursion(arr)
                else return 'finish'
            })
    };
    let listCopy = [].concat(list)
    let asyncList = []
    if (list.length < limit) limit = list.length
    while (limit--) {
        asyncList.push(recursion(listCopy))
    }
    return new Promise((resolve) => {
        Promise.all(asyncList).then(() => resolve(results))
    });
}

function ____downloadFile(url) {
    return new Promise((resolve) => {
        __tool.get(url, (error, response, body) => {
            let filename = url.match(/.*\/(.*?)$/)[1]
            if (!error) {
                const code = response.statusCode
                if (code == 200) {
                    resolve({ url, code, body, message: `${__emoji}${filename} update success` })
                    console.log(`Update Success: ${url}`)
                } else {
                    resolve({ url, code, body, message: `${__emoji}${filename} update fail` })
                    console.log(`Update Fail ${response.statusCode}: ${url}`)
                }
            } else {
                resolve({ url, code: null, body: null, message: `${__emoji}${filename} update fail` })
                console.log(`Update Fail ${error}: ${url}`)
            }
        })
    })
}

function ____extractConf(conf, type) {
    const rex = new RegExp("\\[" + type + "\\](.|\\n)*?(?=\\n($|\\[))", "g")
    let result = rex.exec(conf)
    if (result) {
        result = result[0].split("\n")
        result.shift()
    } else {
        result = []
    }
    return result
}

function ____parseRemoteConf(conf) {
    const lines = conf.split("\n")
    let newLines = []
    lines.forEach((line) => {
        line = line.replace(/^\s*/, "")
        if (line.length > 0 && /^#{3}/.test(line)) {
            line = line.replace(/^#*/, "")
            line = line.replace(/^\s*/, "")
            if (line.length > 0) {
                newLines.push(line)
            }
        }
    })
    return newLines
}

function ____removeGarbage(lines) {
    if (lines.length > 0) {
        let i = lines.length;
        while (i--) {
            const line = lines[i]
            if (line.length == 0 || line.substring(0, 2) == "//") {
                lines.splice(i, 1)
            }
        }
    }
    return lines
}

function ____parseConf(lines) {
    let confObj = {}
    lines.forEach((line) => {
        line = line.replace(/^\s*/, "")
        if (line.length > 0 && line.substring(0, 2) != "//") {
            let urlRegex = /.+\s+url\s+.+/
            let evalRegex = /.+\s+eval\s+.+/
            const avaliable = (() => {
                return urlRegex.test(line) || evalRegex.test(line)
            })()
            if (avaliable) {
                let remote = ""
                let match = []
                if (urlRegex.test(line)) {
                    const value = line.split("url")
                    remote = value[0].replace(/\s/g, "")
                    match = ____parseMatch(value[1])
                }
                if (evalRegex.test(line)) {
                    const value = line.split("eval")
                    remote = value[1].replace(/\s/g, "")
                    match = ____parseMatch(value[0])
                }
                if (remote.length > 0 && match.length > 0) {
                    confObj[remote] = match
                } else {
                    if (__debug) ____throwConfError(line)
                }
            } else {
                if (__debug) ____throwConfError(line)
            }
        }
    })
    if (__log) console.log(`Conf Information:  ${JSON.stringify(confObj)}`)
    return confObj
}

function ____parseMatch(match) {
    let matchs = match.split(" ")
    if (matchs.length > 0) {
        let i = matchs.length;
        while (i--) {
            if (matchs[i].length == 0) {
                matchs.splice(i, 1)
            }
        }
    }
    return matchs
}

function ____throwConfError(line) {
    __tool.notify("Conf Error", "", line)
    $done()
    throw new Error(`Conf Error: ${line}`)
}

function ____Tool() {
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
    _isTask = typeof $request == "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isTask = _isTask
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
        if (_node) console.log(`Write Success: ${key}`);
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
        if (_node) console.log(`Read Success: ${key}`);
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

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

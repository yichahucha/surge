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
$done({
  body
})
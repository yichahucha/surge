## Surge
```
[Script]
http-response ^https?://m?api\.weibo\.c(n|om)/2/(statuses/(unread|extend|positives/get|(friends|video)(/|_)timeline)|stories/(video_stream|home_list)|(groups|fangle)/timeline|profile/statuses|comments/build_comments|photo/recommend_list|service/picfeed|searchall|cardlist|page) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js,requires-body=true
http-response ^https?://(sdk|wb)app\.uve\.weibo\.com(/interface/sdk/sdkad.php|/wbapplua/wbpullad.lua) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js,requires-body=true

[MITM]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```
```
[Script]
cron "0 9,18 * * 1-5" script-path=https://raw.githubusercontent.com/yichahucha/surge/master/cron_daily.js
```
```
[Script]
http-response ^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D script-path=https://raw.githubusercontent.com/yichahucha/surge/master/netflix_imdb.js,requires-body=1
http-request ^https?://ios\.prod\.ftl\.netflix\.com/iosui/user/.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D script-path=https://raw.githubusercontent.com/yichahucha/surge/master/netflix_imdb.js

[MITM]
hostname = ios.prod.ftl.netflix.com
```

## Quan-X
```
[rewrite_local]
^https?://m?api\.weibo\.c(n|om)/2/(statuses/(unread|extend|positives/get|(friends|video)(/|_)timeline)|stories/(video_stream|home_list)|(groups|fangle)/timeline|profile/statuses|comments/build_comments|photo/recommend_list|service/picfeed|searchall|cardlist|page) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js
^https?://(sdk|wb)app\.uve\.weibo\.com(/interface/sdk/sdkad.php|/wbapplua/wbpullad.lua) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js

[mitm]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```

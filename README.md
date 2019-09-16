## Surge
```
[Script]
http-response ^https?://m?api\.weibo\.c(n|om)/2/((profile/)?statuses(/)?(unread|extend|positives/get|(friends|video)(/|_)timeline)|stories/(video_stream|home_list)|(groups|fangle)/timeline|comments/build_comments|photo/recommend_list|service/picfeed|searchall|cardlist|page) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js,requires-body=true
http-response ^https?://(sdk|wb)app\.uve\.weibo\.com(/interface/sdk/sdkad.php|/wbapplua/wbpullad.lua) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js,requires-body=true

[MITM]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```
```
[Script]
cron "0 9,18 * * 1-5" script-path=https://raw.githubusercontent.com/yichahucha/surge/master/cron_daily.js
```

## Quan-X
```
[rewrite_local]
^https?://m?api\.weibo\.c(n|om)/2/((profile/)?statuses(/)?(unread|extend|positives/get|(friends|video)(/|_)timeline)|stories/(video_stream|home_list)|(groups|fangle)/timeline|comments/build_comments|photo/recommend_list|service/picfeed|searchall|cardlist|page) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js
^https?://(sdk|wb)app\.uve\.weibo\.com(/interface/sdk/sdkad.php|/wbapplua/wbpullad.lua) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js

[mitm]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```

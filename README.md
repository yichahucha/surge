## Surge
### wb
```
[Script]
http-response ^https?:\/\/(api|mapi)\.weibo\.(cn|com)\/2/(statuses\/(unread|extend|positives/get|friends\/timeline)|stories\/(video_stream|home_list)|groups\/timeline|fangle\/timeline|profile\/statuses|comments\/build_comments|photo\/recommend_list|service\/picfeed|searchall|cardlist) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js,requires-body=true
http-response ^https?:\/\/(sdk|wb)app\.uve\.weibo\.com(\/interface\/sdk\/sdkad.php|\/wbapplua\/wbpullad.lua) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js,requires-body=true

[MITM]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```
### daliy
```
[Script]
cron "0 9,18 * * 1-5" script-path=https://raw.githubusercontent.com/yichahucha/surge/master/cron_daily.js
```

## Quan-X
```
[rewrite_local]
^https?:\/\/(api|mapi)\.weibo\.(cn|com)\/2/(statuses\/(unread|extend|positives/get|friends\/timeline)|stories\/(video_stream|home_list)|groups\/timeline|fangle\/timeline|profile\/statuses|comments\/build_comments|photo\/recommend_list|service\/picfeed|searchall|cardlist) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js
^https?:\/\/(sdk|wb)app\.uve\.weibo\.com(\/interface\/sdk\/sdkad.php|\/wbapplua\/wbpullad.lua) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/wb_launch.js

[mitm]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```

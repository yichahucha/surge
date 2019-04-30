### Add to Surge
```
[Script]
http-response ^https?:\/\/api\.weibo\.cn\/2\/(groups\/timeline|statuses\/unread|statuses\/extend|comments\/build_comments|photo\/recommend_list|stories\/video_stream|statuses\/positives\/get|stories\/home_list) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js

[MITM]
hostname = api.weibo.cn
```

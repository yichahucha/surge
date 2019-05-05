
# Add To Surge
```
[Script]
http-response ^https?:\/\/api\.weibo\.cn\/2(\/groups\/timeline|\/statuses\/unread|\/statuses\/extend|\/comments\/build_comments|\/photo\/recommend_list|\/stories\/video_stream|\/statuses\/positives\/get|\/stories\/home_list|\/profile\/statuses|\/statuses\/friends\/timeline) script-path=https://raw.githubusercontent.com/yichahucha/surge/master/wb_ad.js

[MITM]
hostname = api.weibo.cn
```
# Custom Regular
**If don't want use script filtering, deletes the specified regular.**

| regular path| wb | filter |
| --- | --- | --- |
| \/statuses\/unread | 首页（全部关注、热门） | 广告、其他推荐、关注推荐、点赞推荐、会员专属卡片 |
| \/groups\/timeline | 首页（分组好友圈、新鲜事等等） | 广告、其他推荐、会员专属卡片 |
| \/statuses\/extend | 详情 | 计划广告、相关推荐|
| \/comments\/build_comments | 评论 | 推荐、相关内容 |
| \/photo\/recommend_list | 相关图集 | 移除 |
| \/stories\/video_stream | 视频（故事） | 广告 |
| \/statuses\/positives\/get | 首页（作者的其他wb） | 移除 |
| \/stories\/home_list | 首页（wb故事） | 移除 |
| \/profile\/statuses | 个人主页（可能感兴趣的人） | 移除 |
| \/statuses\/friends\/timeline | 首页（最新wb） | 广告、其他推荐、关注推荐、点赞推荐、会员专属卡片 |

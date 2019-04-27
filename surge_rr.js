//解锁人人视频原画

//var body = '{"data":{"medalList":[]}}';
//var url = 'https://api.rr.tv/user/profile';
var jsbody = JSON.parse(body);
var path1 = '/user/profile';
var path2 = '/v3plus/user/detail';

if (url.indexOf(path1) != -1) {
    jsbody.data.medalList = JSON.parse('[{"name":"yel","endTime":"2022-12-22 22:22:22","imgUrl":"http://img.rr.tv/screenshot/20171108/o_1510128764030.png","id":1}]');
    jsbody.data.privilegeList = JSON.parse('[{"effectObject":"video","action":"play","func":"originalPainting","description":"解锁原画","icon":"jiesuoyuanhua","endTime":1671718942000},{"effectObject":"coin","action":"sign","func":"5","description":"签到额外银币+5","icon":"qiandaoyinbi","endTime":1671718942000},{"effectObject":"growth","action":"play","func":"0.4","description":"经验值加成+40%","icon":"jingyanzhijiacheng","endTime":1671718942000},{"effectObject":"video","action":"play","func":"noLimit","description":"看剧无限制","icon":"kanjuwuxianzhi","endTime":1671718942000},{"effectObject":"video","action":"play","func":"noAd","description":"看剧无广告","icon":"kanjuwuguanggao","endTime":1671718942000}]');
    jsbody.data.createTime = 1671718942000;
    jsbody.data.newUser = true;
    jsbody.data.level = 30;
    jsbody.data.nickName = 'yel';
    jsbody.data.achievementCount = 1500;
}

if (url.indexOf(path2) != -1) {
    jsbody.data.medalList = JSON.parse('[{"name":"yel","endTime":"2022-12-22 22:22:22","imgUrl":"http://img.rr.tv/screenshot/20171108/o_1510128764030.png","id":1}]');
}

JSON.stringify(jsbody);
//console.log(jsbody);

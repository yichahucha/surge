//解锁人人视频原画、去广告

var result = body
let path1 = '/user/profile';
let path2 = '/v3plus/user/detail';
let path3 = '/ad/getAll';

if (url.indexOf(path1) != -1) {
    var jsbody = JSON.parse(body);
    jsbody.data.user.medalList = JSON.parse('[{"name":"原画","endTime":"2022-12-22 22:22:22","imgUrl":"http://img.rr.tv/screenshot/20171108/o_1510128764030.png","id":1}]');
    jsbody.data.user.privilegeList = JSON.parse('[{"effectObject":"video","action":"play","func":"originalPainting","description":"解锁原画","icon":"jiesuoyuanhua","endTime":1671718942000},{"effectObject":"coin","action":"sign","func":"5","description":"签到额外银币+5","icon":"qiandaoyinbi","endTime":1671718942000},{"effectObject":"growth","action":"play","func":"0.4","description":"经验值加成+40%","icon":"jingyanzhijiacheng","endTime":1671718942000},{"effectObject":"video","action":"play","func":"noLimit","description":"看剧无限制","icon":"kanjuwuxianzhi","endTime":1671718942000},{"effectObject":"video","action":"play","func":"noAd","description":"看剧无广告","icon":"kanjuwuguanggao","endTime":1671718942000}]');
    jsbody.data.user.createTime = 1671718942000;
    jsbody.data.user.newUser = true;
    jsbody.data.user.level = 30;
    jsbody.data.user.nickName = '原画';
    jsbody.data.user.achievementCount = 1500;
    result = JSON.stringify(jsbody);
}

if (url.indexOf(path2) != -1) {
    var jsbody = JSON.parse(body);
    jsbody.data.user.medalList = JSON.parse('[{"name":"yel","endTime":"2022-12-22 22:22:22","imgUrl":"http://img.rr.tv/screenshot/20171108/o_1510128764030.png","id":1}]');
    result = JSON.stringify(jsbody);
}

if (url.indexOf(path3) != -1) {
    var jsbody = JSON.parse(body);
    jsbody.data.adList = [];
    result = JSON.stringify(jsbody);
}

result;

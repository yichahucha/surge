/**
    每日壹句（有道词典）+ 每日打卡提醒（例如：corn "0 9,18 * * 1-5" 周一到周五，早九晚六）+ 下拉通知点击链接跳转钉钉打卡页面
**/
$httpClient.get('https://dict.youdao.com/infoline/style/cardList?mode=publish&client=mobile&style=daily&size=2', function (error, response, data) {
    let obj = JSON.parse(data);
    let date = new Date();
    let isAM = date.getHours() < 12 ? true : false
    let title = (isAM ? '上' : '下') + "班打卡" + (isAM ? ' ☀️' : ' 🌙');
    let subtitle = '';
    let des = '打卡！！！';
    if (!error) {
        if (obj && obj.length > 1) {
            let yi = obj[1];
            des = yi.title + '\n' + yi.summary + '\n\n\n\ndingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html'
        }
    }
    $notification.post(title, subtitle, des);
    $done();
});

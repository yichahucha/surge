/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-09-20 13:06:02
 * @LastEditTime: 2019-09-20 14:01:38
 * @LastEditors: Please set LastEditors
 */
/**
 * ^https?://ios\.prod\.ftl\.netflix\.com/iosui/(user|warmer)/(.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D|.+id=\d+)
 * 
 * http-response ^https?://ios\.prod\.ftl\.netflix\.com/iosui/(user|warmer)/(.+path=%5B%22videos%22%2C%\d+%22%2C%22summary%22%5D|.+id=\d+) script-path=./netflix_imdb.js,requires-body=true
 * 
 * ios.prod.ftl.netflix.com
 */

const path1 = "/iosui/user";
const path2 = "/iosui/warmer";

// var request = $request.url;
var body = $response.body;
console.log('哈哈哈哈哈哈哈');
$done({ body });

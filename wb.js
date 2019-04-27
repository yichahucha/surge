function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function dec2hex(dec, padding){
  return parseInt(dec, 10).toString(16).padStart(padding, '0');
}

function utf8StringToUtf16String(str) {
  var utf16 = [];
  for (var i=0, strLen=str.length; i < strLen; i++) {
    utf16.push('\\\\u')
    utf16.push(dec2hex(str.charCodeAt(i), 4));
  }
  return utf16.join('');
}


var keywords = ['复联4', '复联', '复仇者联盟4', '复仇者联盟', '钢铁侠', '托尼', '美国队长', '美队', '黑寡妇', '寡姐', '蜘蛛侠', '浩克', '绿巨人', '鹰眼', '灭霸', '雷神', '惊奇队长', '惊奇', '蚁人', '银河护卫队', '银队'];

var result = body;

keywords.forEach(function(k) {
  result = replaceAll(result, k, '喵喵喵');
  result = replaceAll(result, utf8StringToUtf16String(k), "\u55b5\u55b5\u55b5");  
});

result;
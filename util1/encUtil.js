/**加密解密处理类
 * Created by che on 2017/7/6.
 */
const crypto = require('crypto');
var exp = module.exports;
var secrectKey = 'guandan..1312_secrectKey';

/**
 * 仅限于密码加密
 * @param str 需要加密的字符串
 * @returns 加密后的字符串
 * @author che
 */
function padHamEnc(str) {
  var hmac = crypto.createHmac('sha1', secrectKey);
  hmac.update(content);
  return hmac.digest('hex');
}

var changePosition = function (str) {
  var len = str.length;
  var fan = '';
  for (var i = 0; i < len; i++) {
    fan += str[len - i - 1];
  }
  return fan;
};

var compileStr = function (str) {
  var c = String.fromCharCode(str.charCodeAt(0) + str.length);
  for (var i = 1; i < str.length; i++) {
    c += String.fromCharCode(str.charCodeAt(i) + str.charCodeAt(i - 1));
  }
  var cc = escape(c);
  return cc;
};

var uncompileStr = function (code) {
  code = unescape(code);
  var c = String.fromCharCode(code.charCodeAt(0) - code.length);
  for (var i = 1; i < code.length; i++) {
    c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
  }
  return c;
};

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57,
  58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6,
  7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

var base64encode = function (str) {
  var out, i, len;
  var c1, c2, c3;
  len = str.length;
  i = 0;
  out = "";
  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff;
    if (i == len) {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt((c1 & 0x3) << 4);
      out += "==";
      break;
    }
    c2 = str.charCodeAt(i++);
    if (i == len) {
      out += base64EncodeChars.charAt(c1 >> 2);
      out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      out += base64EncodeChars.charAt((c2 & 0xF) << 2);
      out += "=";
      break;
    }
    c3 = str.charCodeAt(i++);
    out += base64EncodeChars.charAt(c1 >> 2);
    out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
    out += base64EncodeChars.charAt(c3 & 0x3F)
  }
  return out;
};

var base64decode = function (str) {
  var c1, c2, c3, c4;
  var i, len, out;
  len = str.length;
  i = 0;
  out = "";
  while (i < len) {
    do {
      c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
    } while (i < len && c1 == -1);
    if (c1 == -1)
      break;
    do {
      c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff]
    } while (i < len && c2 == -1);
    if (c2 == -1)
      break;
    out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
    do {
      c3 = str.charCodeAt(i++) & 0xff;
      if (c3 == 61)
        return out;
      c3 = base64DecodeChars[c3]
    } while (i < len && c3 == -1);
    if (c3 == -1)
      break;
    out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
    do {
      c4 = str.charCodeAt(i++) & 0xff;
      if (c4 == 61)
        return out;
      c4 = base64DecodeChars[c4]
    } while (i < len && c4 == -1);
    if (c4 == -1)
      break;
    out += String.fromCharCode(((c3 & 0x03) << 6) | c4)
  }
  return out;
};

/**
 * 加密字符串方法
 * @param str 需要加密的字符串
 * @author che
 */
exp.encStr = function (str) {
  var self = this;
  if (str == null || str == undefined) {
    str = '';
  }
  if (!self.isEnc(str)) {
    if (str.replace(/(^\s*)|(\s*$)/g, "") != "") {
      var appendStr = compileStr(changePosition(str)) + secrectKey;
      return base64encode(changePosition(appendStr));
    }
  }
  return str;
};

/**
 * 解密字符串方法
 * @param str 需要解密的字符串
 * @author che
 */
exp.decStr = function (str) {
  if (str.replace(/(^\s*)|(\s*$)/g, "") != "") {
    var appendStr = changePosition(base64decode(str));
    if (appendStr.indexOf(secrectKey) > 0) {
      return changePosition(uncompileStr(appendStr.replace(secrectKey, '')));
    }
  }
  return str;
};

exp.isEnc = function (str) {
  if (str.replace(/(^\s*)|(\s*$)/g, "") != "") {
    var appendStr = changePosition(base64decode(str));
    if (appendStr.indexOf(secrectKey) > 0) {
      return true;
    }

  }
  return false;
};

exp.valicodeTran = function (jsonStr) {
  var self = this;
  if (undefined == jsonStr.param) {
    return {
      code: false,
      data: jsonStr
    };
  }
  var param = jsonStr.param;
  jsonStr = JSON.parse(self.decStr(param));

  var self = this;
  var code = jsonStr.code;
  if (code) {
    delete jsonStr['code'];
    var str;
    for (var item in jsonStr) {
      if (undefined == str) {
        str = item;
      } else {
        str = str + '&' + item;
      }
    }
    var encstr = self.encStr(str);

    if (encstr == code) {
      return {
        code: true,
        data: jsonStr
      };
    }
  }
  return {
    code: false,
    data: jsonStr
  };
};

exp.encStrMD5 = function (str) { 
  let md5 = crypto.createHash('md5');
  let signresult = md5.update(str).digest('hex').toLowerCase();
  return signresult;
}

console.log(exp.decStr('36e1a5072c78359066ed7715f5ff3da8'));

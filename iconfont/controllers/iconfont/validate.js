/**
 * Created by jianlong.yao on 2014/9/12.
 */

module.exports.keywordValid = function (keywords) {
    var keywords = keywords,
        re = /select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%|=/gi,
        msg = '';

    if(keywords == null || keywords == '')  {
        msg = "请输入关键字!";
        return msg;
    }

    keywords = keywords.toLowerCase();

    if(re.test(keywords)) {
        msg = "搜索关键字中包含非法字符!";
    } else {
        msg = true;
    }

    return msg;
};

module.exports.isJson = function(obj){

    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;

    try{
        JSON.parse(obj);
        isjson = true;
    } catch(ex){
        isjson = false;
    }
    return isjson;
};
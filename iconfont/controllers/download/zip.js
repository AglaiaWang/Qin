/**
* @author missy missy.liu@qunar.com 2015-01-03
* 打包功能模块
*/


var db = require('./../../models'),
    fs = require('fs'),
    path = require('path'),
    font = require('./../../middleware');

/**
 * 打包功能模块
 */
function getZip(group){
    var rtn = {};
    db.QunarFont.findAll({
        attributes: ['code','id']
    }).success(function (result) {
        var arry = [];
        var codes = [];
        for(var i = 0;i<result.length;i++){
            arry.push(result[i]["id"]);
            codes.push(result[i]["code"]);
        }
       db.Icon.findAll({
            where: {
                id: arry
            },
            attributes: ['name',"id"]
        }).success(function (result) {
            for(var i = 0;i<result.length;i++){
                var name = result[i]["name"];
                var code = codes[i];
                var id = result[i]["id"];
                rtn[id]= {"name":name, "code":code, "group":group};
            }
            var startTime = new Date().getTime(),
                endTime = 0;
            try{
                font.main(path.join(__dirname, '/../public/svg/'), path.join(__dirname, '/../public/Fonts/'), {
                    fontName: 'Qunar',
                    className: 'qif',
                    png: true,
                    zip: 'all.zip',
                    fileJSON: JSON.stringify(rtn)
                }).done(function(ret) {
                    console.log('----------');
                    console.log('Total Result : ', ret ? 'Failure' : 'Success');
                }).progress(function(key, data) {
                    endTime = new Date().getTime();
                    console.log('Task : ' + key + " | Result : " + (data ? data.err ? 'Failure' : 'Success' : 'Skip') + ' | Time : ' + (endTime - startTime) + 'ms');
                    startTime = endTime;
                });
            }catch(e){
                console.log('生成.zip文件出现异常！'+ e.toString())
            }
        }).error(function() {
            console.log('err');
        });
    }).error(function() {
        console.log('error');
    });

}

















// function zipC(cid, obj){//压缩处理obj = {group:true,userId:1}

//     //分组（部分）下载，登陆用户
//     //前面分开组名来传递单个collect_id即是分组
//     //通过分组名找到cid

//     var dbModel = obj.group || 'Common';

//     var startTime = new Date().getTime(),
//         endTime = 0,
//         tmpFolder = 'Q'+startTime;

//     var rtn = {};

//     db.Collect_qFont.findAll({
//         where: {
//             collect_id: cid
//         },
//         attributes: ['qFont_id']
//     }).success(function (result) {
//         var arry = [];
//         for(var i = 0;i<result.length;i++){
//             arry.push(result[i]["qFont_id"]);
//         }

//         db.Icon.findAll({
//             where: {
//                 id: arry
//             },
//             attributes: ['name']
//         }).success(function (result) {
//             for(var i = 0;i<result.length;i++){
//                 var name = result[i]["name"];
//                 rtn[name]= {"name":name};
//             }
//         }).error(function() {
//             console.log('err');
//         });

//         db.QunarFont.findAll({
//             where: {
//                 id: arry
//             },
//             attributes: ['code']
//         }).success(function (result) {
//             for(var i = 0;i<result.length;i++){
//                 for(var key in rtn) {
//                     rtn[key].code = result[i]['code'];
//                     rtn[key].group = dbModel;
//                 }
//             }
//             console.log(result);
//         }).error(function() {
//             console.log('err');
//         });
//     }).error(function() {
//         console.log('error');
//     });

//     var startTime = new Date().getTime(),
//         endTime = 0;
//     try{
//         font.main(path.join(__dirname + '/../public/svg/'), zipPath+"/"+tmpFolder+"/", {
//             fontName: 'Qunar',
//             className: 'qif',
//             png: true,
//             zip: 'qunar-font-'+cid+'.zip',
//             fileJSON: JSON.stringify(rtn)
//         }).done(function(ret) {

//             console.log('----------');
//             console.log('Total Result : ', ret ? 'Failure' : 'Success');
//         }).progress(function(key, data) {
//             endTime = new Date().getTime();
//             console.log('Task : ' + key + " | Result : " + (data ? data.err ? 'Failure' : 'Success' : 'Skip') + ' | Time : ' + (endTime - startTime) + 'ms');
//             startTime = endTime;
//         });
//     }catch(e){
//         console.log('生成.zip文件出现异常！'+ e.toString())
//     }
// }


module.exports.getZip= getZip;

/*
zipC(1, function () {
    console.log("机票字体生成完毕");
},{group:true, userId: 3});*/

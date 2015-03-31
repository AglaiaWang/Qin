/**
* @author missy missy.liu@qunar.com 2015-01-03
* 下载功能模块
*/

var main = require('./../../middleware/index'),
	path = require('path'),
	mime = require('mime'),
	fs = require('fs'),
	zip = require('./zip'),
	db = require('./../../models'),
    svg2png = require("svg2png"),
    gulp = require('gulp'),
    svgSprite = require('gulp-svg-sprite'),
    zipdir = require('zip-dir'),
    svgicons2svgfont = require('svgicons2svgfont'),
    options = {
        fontName: 'iconfont',
        normalize: true
    },
    svg2ttf = require('svg2ttf'),
    ttf2woff = require('ttf2woff'),
    ttf2eot = require('ttf2eot'),
    template = require("ejs");

/**
 * 下载全部字体图标
 */
module.exports.allFontsZip = function(req, res, opts){
    var pat = __dirname+'/../../public/Fonts/all.zip';
    res.download(pat);
}

/**
 * 下载部分字体图标
 */
module.exports.partFontsZip = function(req, res, opts){
    var ids =opts.ids.split(",");
    var group = opts.group;
    var rtn = {};
    db.Icon.findAll({
        where: {
            id: ids
        },
        attributes: ['name','id']
    }).success(function (result) {
        for(var i = 0;i<result.length;i++){
            var name = result[i]["name"];
            var id = result[i]["id"];
            rtn[id]= {"name":name};
        }
        db.QunarFont.findAll({
            where: {
                id: ids || opts.ids.split(",")
            },
            attributes: ['code',"id"]
        }).success(function (result) {
            for(var i = 0;i<result.length;i++){
                var code = result[i]["code"];
                var id = result[i].id;
                rtn[id].code = code;
            }
            var startTime = new Date().getTime(), endTime = 0;
            var expose = new Date - 0;
            var random = Math.random(expose);
            try{
                main.main(path.join(__dirname, '/../../public/svg/'), path.join(__dirname, '/../../public/download/partDownload/',random.toString()), {
                    fontName: 'Qunar',
                    className: 'qif',
                    png: true,
                    zip: 'qunar-font'+ random +'.zip',
                    fileJSON: JSON.stringify(rtn)
                }).done(function(ret) {
                    // console.log('Total Result : ', ret ? 'Failure' : 'Success');
                    // fs.renameSync(path.join(__dirname, '/../../public/download/partDownload/'+ random.toString() +'/qunar-font'+ random +'.zip'),path.join(__dirname, '/../../public/download/zip/font/qunar-font'+ random +'.zip'))
                    res.download(path.join(__dirname, '/../../public/download/partDownload/'+ random.toString() +'/qunar-font'+ random +'.zip'));
                }).progress(function(key, data) {
                    endTime = new Date().getTime();
                    // console.log('Task : ' + key + " | Result : " + (data ? data.err ? 'Failure' : 'Success' : 'Skip') + ' | Time : ' + (endTime - startTime) + 'ms');
                    startTime = endTime;
                });
            }catch(e){
                console.log('生成.zip文件出现异常！'+ e.toString())
            }
        }).error(function (err) {
            console.log('error',err);
        });
    }).error(function() {
        console.log('err');
    });
}

/**
 * 移除文件夹及其内文件
 */
var rmdirSync = (function(){
    function iterator(url,dirs){
        var stat = fs.statSync(url);
        if(stat.isDirectory()){
            dirs.unshift(url);//收集目录
            inner(url,dirs);
        }else if(stat.isFile()){
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function inner(path,dirs){
        var arr = fs.readdirSync(path);
        for(var i = 0, el ; el = arr[i++];){
            iterator(path+"/"+el,dirs);
        }
    }
    return function(dir,cb){
        cb = cb || function(){};
        var dirs = [];
        try{
            iterator(dir,dirs);
            for(var i = 0, el ; el = dirs[i++];){
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();

/**
 * 生成SVG雪碧图
 */
module.exports.SpritesZip = function(req, res){
    config = {
        shape: {
            dimension: {
                maxWidth: req.query.size,
                maxHeight: req.query.size
            },
        },
        mode: {
            css: {
                render: {
                    css: true
                }
            }
        },
        symbol: true
    };
    var ids = req.query.ids;
    var svgs = __dirname +"/../../public/svg/*.svg";
    var total = fs.readdirSync(__dirname + "/../../public/svg/").length;
    var names = [];
    if(ids != "0"){
        ids = ids.split(",");
        ids = ids.sort(function(a,b){
            return  parseInt(a)-parseInt(b);
        });
        db.Icon.findAll({
            where:{id:ids},
            attributes:["name","id"]
        }).success(function(datas){
            rmdirSync(path.join(__dirname,"/../../public/download/cache"));
            fs.mkdirSync(path.join(__dirname,"/../../public/download/cache"));
            for(key in datas){
                names.push(datas[key].name);
            }
            for(var i = 0;i<ids.length;i++){
                var str = fs.readFileSync(path.join(__dirname,"/../../public/svg/"+ids[i]+".svg"), 'utf-8');
                fs.writeFileSync(path.join(__dirname,"/../../public/download/cache/"+names[i]+".svg"),str,"utf-8");
            }
            svgs = __dirname+"/../../public/download/cache/*.svg";
            total = 0;
            svgTranslate(req,res,names,total,svgs);
        })
    }else{
       svgTranslate(req,res,names,total,svgs);
    }
}

/**
 * SVG雪碧图转换为PNG
 */
function svgTranslate(req,res,names,total,svgs){
    var time = new Date();
    var dirname = parseInt(Math.random()*100000)+""+new Date().getTime();
    gulp.src(svgs, {cwd: 'assets'})
        .pipe(svgSprite(config))
        .pipe(gulp.dest('public/download/sprites/'+dirname))
        .on("end",function(){
            console.log("sprite done:",new Date -time);
            var dir = path.join(__dirname,'/../../public/download/sprites',dirname,'css/svg/');
            var zipDir = path.join(__dirname,'/../../public/download/sprites',dirname);
            var filesName  = fs.readdirSync(dir)[0];
            fs.renameSync(dir+filesName,dir+"1.svg");
            var spritePath = path.join(__dirname,'/../../public/download/sprites/',dirname,'css/svg/1.svg');
            var pngPath = path.join(__dirname,'/../../public/download/sprites/',dirname,'css/svg/1.png');
            fs.renameSync(path.join(__dirname,'/../../public/download/sprites/',dirname,'css/sprite.css'),path.join(__dirname,'/../../public/download/sprites/',dirname,'css/sprite_svg.css'));
            var reg = RegExp(filesName,"g");
            var datas = fs.readFileSync(path.join(__dirname,'/../../public/download/sprites/',dirname,'css/sprite_svg.css'),"utf-8");
            fs.writeFileSync(path.join(__dirname,'/../../public/download/sprites/',dirname,'css/sprite_png.css'),datas.replace(reg,"1.png"),"utf-8");
            var str = fs.readFileSync(path.join(__dirname,'/../../views/templates/sprite.ejs'), 'utf-8');
            var htmlSvg = template.render(str,{
                total:total,
                names:names,
                width:req.query.size,
                height:req.query.size,
                style:"sprite_svg"
            });
            fs.writeFileSync(path.join(__dirname,'/../../public/download/sprites/',dirname,'css/sprite_svg.css'),datas.replace(reg,"1.svg"),"utf-8");
            str = fs.readFileSync(path.join(__dirname,'/../../views/templates/sprite.ejs'), 'utf-8');
            var htmlPng = template.render(str,{
                total:total,
                names:names,
                width:req.query.size,
                height:req.query.size,
                style:"sprite_png"
            });
            fs.writeFileSync(path.join(__dirname, '/../../public/download/sprites/',dirname,'index_png.html'), htmlPng, 'utf-8')
            fs.writeFileSync(path.join(__dirname, '/../../public/download/sprites/',dirname,'index_svg.html'), htmlSvg, 'utf-8')
            svg2png(spritePath,pngPath, 1, function (err) {
                zipdir(zipDir, {
                    saveTo: path.join(zipDir,"QuanrSprites.zip")
                }, function(err, buffer) {
                        res.download(path.join(zipDir,"QuanrSprites.zip"))
                });
            });
        });
}

/**
 * 更新全部字体图标并下载
 */
module.exports.generateFont = function(req, res, opts) {
    var baseIndex;
    var sources = [];
    db.QunarFont.max('code',{}).success(function(result){
        if (result != null && result != "") {
            baseIndex = parseInt(result, 16);
        }
        var rtn = {},array = [];
        db.Icon.findAll({
            where: {
                id: opts.id
            },
            attributes: ['name','id']
        }).success(function (result) {
            for(var i = 0;i<result.length;i++){
                var name = result[i]["name"];
                var id = result[i]["id"];
                rtn[id]= {"name":name};
                baseIndex ++;
                rtn[id].code = baseIndex.toString(16);
                rtn[id].group = opts.group || 'hotel';
            }
            for(key in rtn){
                var msg = {};
                msg.id = key;
                msg.code = rtn[key].code;
                msg.deleted = 0;
                array.push(msg);
            }

            db.QunarFont.bulkCreate(array).then(function() {
                db.QunarFont.hasOne(db.Icon , {
                    foreignKey : 'id'
                });
                db.QunarFont.findAll({
                    include : [{
                        model:db.Icon,
                        attributes:['name']
                    }]
                }).success(function(result){
                    for(key in result){
                        var source = {};
                        source.name  = result[key].Icon.name;
                        source.codepoint = result[key].code;
                        source.path = path.join(__dirname,"/../../public/svg/"+result[key].id+".svg");
                        sources.push(source);
                    }
                    svgicons2svgfont(sources.map(function(source){
                    return {
                          name: "quanr-"+source.name,
                          codepoint: parseInt(source.codepoint,16),
                          stream:  fs.createReadStream(source.path)
                        }
                    }),options).pipe(fs.createWriteStream(path.join(__dirname,"/../../public/Fonts/fonts/Qunar.svg")))
                    .on("finish",function(){
                        var data = fs.readFileSync(path.join(__dirname,"/../../public/Fonts/fonts/Qunar.svg"));
                        var ttf = svg2ttf(data.toString(), {});
                        fs.writeFileSync(path.join(__dirname,"/../../public/Fonts/fonts/Qunar.ttf"), new Buffer(ttf.buffer));
                        data = fs.readFileSync(path.join(__dirname,"/../../public/Fonts/fonts/Qunar.ttf"));
                        var eot = ttf2eot(data, {});
                        fs.writeFileSync(path.join(__dirname,"/../../public/Fonts/fonts/Qunar.eot"), new Buffer(eot.buffer));
                        var woff = ttf2woff(data, {});
                        fs.writeFileSync(path.join(__dirname,"/../../public/Fonts/fonts/Qunar.woff"), new Buffer(woff.buffer));
                        var str = fs.readFileSync(path.join(__dirname + '/../../views/templates/download_index.ejs'), 'utf-8');
                        var html = template.render(str,{
                            total: sources.length,
                            datas:sources,
                            zipFile: '#'
                        });
                        fs.writeFileSync(path.join(__dirname,"/../../public/Fonts/index.html"), html, 'utf-8');
                        try{
                            fs.unlinkSync(path.join(__dirname,"/../../public/Fonts/all.zip"));
                        }catch(e){
                            console.log(e);
                        }
                        zipdir(path.join(__dirname,"/../../public/Fonts"), {
                                saveTo: path.join(__dirname,"/../../public/Fonts/all.zip")
                            }, function(err, buffer) {
                            });
                        });
                        db.Icon.update({
                            'isAddQFont': 1
                        }, {where: {
                            id: opts.id
                        }}).then(function(result) {
                            res.json({
                               status : 0,
                               message : "修改成功"
                            });
                        });
                });
            }).error(function (err) {
                res.json({status: -500, message: "修改失败, 请重试"});
            });
        }).error(function() {
            console.log('err');
        });
    });
};

var Deferred = require('../async/deferred'),
    fs = require('fs'),
    path = require('path');

var lstat = process.platform === "win32" ? "stat" : "lstat",
    lstatSync = lstat + "Sync";

function cleanDir(dir) {
    fs.readdirSync(dir).forEach(function(d) {
        d = path.join(dir, d);
        if (fs[lstatSync](d).isDirectory()) {
            cleanDir(d);
            fs.rmdirSync(d);
        } else {
            fs.unlinkSync(d);
        }
    });
}

module.exports = function(dir) {
    return new Deferred().outer(function(that) {
        fs.exists(dir, function(data, err) {
            if (err) {
                that.resolve({
                    err: true
                });
            } else if (data) {
                that.resolve({
                    err: false
                });
            } else {
                fs.mkdir(dir, function(data, err2) {
                    that.resolve({
                        err: !! err2
                    });
                });
            }
        });
    });
};

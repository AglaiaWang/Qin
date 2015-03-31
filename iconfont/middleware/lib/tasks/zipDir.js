var Deferred = require('../async/deferred'),
    zipdir = require('zip-dir'),
    path = require('path');

module.exports = function(dist, file) {
    return new Deferred().outer(function(that) {
        zipdir(dist, {
            saveTo: path.join(dist, file)
        }, function(err, buffer) {
            that.resolve({
                err : !!err
            });
        });
    });
};

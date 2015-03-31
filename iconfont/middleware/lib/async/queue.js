var Deferred = require('./deferred');

function associate(arrVal, arrKey) {
    var obj = {};
    for (var i = 0; i < arrKey.length; i++) {
        obj[arrKey[i]] = arrVal[i];
    }
    return obj;
}

function isFunction(source) {
    return (typeof source === 'function');
}

module.exports = function(list, keys, dynamic) {
    var deferred = new Deferred(),
        queue = dynamic ? list : list.slice(0),
        ret = [],
        index = -1,
        getKey = function(index) {
            getKey = (keys && keys.length) ? function(index) {
                return keys[index];
            } : function(index) {
                return index;
            };
            return getKey(index);
        },
        next = function() {
            index++;
            var pro = queue.shift();
            if (pro && isFunction(pro.then)) {
                pro.all(function(data) {
                    deferred.notify(getKey(index), data, list);
                    ret[index] = data;
                    next();
                });
            } else if (pro) {
                if (isFunction(pro)) {
                    var p = pro(ret[index - 1], associate(ret, keys));
                    if (p && isFunction(p.then)) {
                        p.all(function(data) {
                            deferred.notify(getKey(index), data, list);
                            ret[index] = data;
                            next();
                        });
                    } else {
                        deferred.notify(getKey(index), p, list);
                        ret[index] = p;
                        next();
                    }
                } else {
                    deferred.notify(getKey(index), pro, list);
                    ret[index] = pro;
                    next();
                }
            } else {
                if (keys && keys.length) {
                    ret = associate(ret, keys);
                }
                deferred.resolve.call(null, ret);
            }
        };

    return deferred.outer(function() {
        setTimeout(next, 0);
    });
};

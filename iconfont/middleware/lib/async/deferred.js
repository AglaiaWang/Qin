function slice(arr) {
    return [].slice.call(arr);
}

function isFunction(source) {
    return (typeof source === 'function');
}

module.exports = function() {

    var status = 'pending';

    var ret;

    var events = (function() {

        var binds = {
            resolve: [],
            inject: [],
            notify: []
        };

        return {
            add: function(type, fn) {
                binds[type].push(fn);
            },
            remove: function(type, fn) {
                binds[type].splice(binds[type].indexOf(fn), 1);
            },
            fire: function(type, args) {
                binds[type].forEach(function(fn) {
                    (function(f) {
                        f.apply(null, args);
                    })(fn);
                });
            }
        };
    })();

    var bind = function(onResolved, onInjected, onProgressed) {
        if (isFunction(onResolved)) {
            if (status == 'resolved') {
                onResolved.apply(null, ret);
            } else if (status == 'pending') {
                events.add('resolve', onResolved);
            }
        }
        if (isFunction(onInjected)) {
            if (status == 'injected') {
                onInjected.apply(null, ret);
            } else if (status == 'pending') {
                events.add('inject', onInjected);
            }
        }
        if (isFunction(onProgressed)) {
            events.add('notify', onProgressed);
        }
    };

    var that = {};

    that.all = function(onResolvedOrInjected) {
        bind(onResolvedOrInjected, onResolvedOrInjected);
        return that;
    };

    that.done = function(onResolved) {
        bind(onResolved);
        return that;
    };

    that.fail = function(onInjected) {
        bind(null, onInjected);
        return that;
    };

    that.progress = function(onProgressed) {
        bind(null, null, onProgressed);
        return that;
    };

    that.unProgress = function(onProgressed) {
        events.remove('notify', onProgressed);
    };

    that.then = function(onResolved, onInjected, onProgressed) {
        bind(onResolved, onInjected, onProgressed);
        return that;
    };

    that.resolve = function() {
        if (status == 'pending') {
            status = 'resolved';
            ret = slice(arguments);
            events.fire('resolve', ret);
        }
        return that;
    };

    that.inject = function() {
        if (status == 'pending') {
            status = 'injected';
            ret = slice(arguments);
            events.fire('inject', ret);
        }
        return that;
    };

    that.notify = function() {
        events.fire('notify', slice(arguments));
        return that;
    };

    that.state = function() {
        return status;
    };

    that.outer = function(startFn) {
        return {
            all: function(onResolvedOrInjected) {
                that.all(onResolvedOrInjected);
                startFn(that);
                return that;
            },
            done: function(onResolved) {
                that.done(onResolved);
                startFn(that);
                return that;
            },
            fail: function(onInjected) {
                that.fail(onInjected);
                startFn(that);
                return that;
            },
            progress: function(onProgressed) {
                that.progress(onProgressed);
                startFn(that);
                return that;
            },
            unProgress: function(onProgressed) {
                that.unProgress(onProgressed);
                return that;
            },
            then: function(onResolved, onInjected, onProgressed) {
                that.then(onResolved, onInjected, onProgressed);
                startFn(that);
                return that;
            }
        };
    };

    return that;

};

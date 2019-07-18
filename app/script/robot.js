var cwd = process.cwd();
//经典掼弹压力测试
var userManager = require(cwd + '/app/script/user');
var Pomelo = require("pomelo-nodejsclient-websocket");

var START = 'start';
var END = 'end';

var ActFlagType = {
    ENTRY: 0,
    ENTER_SCENE: 1,
    ATTACK: 2,
    MOVE: 3,
    PICK_ITEM: 4
};

function monitor(type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

var async = require('async');
var pomelo = new Pomelo();

var log4js = require('log4js');

log4js.configure("config/log4js.json");
var logInfo = log4js.getLogger('logInfo');
// logInfo.info("process.iindex=========", this.actor.id)

function simulateRealPlayer() {
    // userManager.getUser(function (user) {
    //     if (!user) {
    //         return console.log('no user');
    //     }
    //     logInfo.info("---username----" + user.userName);
    //     queryEntry(user);
    // })
    userManager.getUserlocal(function (user) {
        if (!user) {
            return console.log('no user');
        }
        logInfo.info("---username----" + user.userName);
        queryEntry(user);
    })
}

function queryEntry(user) {
    var result = {};
    var gatePort = 5600;

    async.waterfall([
        function (cb) {
            // 47.111.75.80
            pomelo.init({ host: '192.168.1.211', port: gatePort }, function (err) {
                cb(err);
            });
        },
        function (cb) {
            pomelo.request('gate.gateHandler.queryEntry', { uid: user.userName }, function (err, data) {
                //pomelo.disconnect();

                if (!!data) {
                    result = data;
                }
                if (data.code === 2001) {
                    console.log('Servers error!');
                    return;
                }
                console.log('queryEntry success');

                cb();
            });
        },
        function (cb) {
            entry(result.host, result.port, user, function (err, code) {
                cb(err);
            })
        }
    ], function () {

    });
}

function entry(host, port, user, callback) {
    var entryData;

    var code;
    async.waterfall([
        function (cb) {
            pomelo.init({ host: host, port: port }, function (err) {
                // console.warn('entry init error:',err);
                monitor(START, 'entry', ActFlagType.ENTRY);
                cb(err);
            });
        },
        function (cb) {
            console.log(user.password);

            var msg = { clientType: 'pc', mobile: user.userName, password: user.password, mode: 2, deviceID: Math.random().toString(36).substr(2), isReconnect: false };
            pomelo.request('connector.entryHandler.login', msg, function (err, data) {
                if (err || data.code != 200) {
                    return console.log(err);
                }
                console.log('login success');
                entryData = data;
                monitor(END, 'entry', ActFlagType.ENTRY);
                cb();
            });
        },
        function (cb) {
            toRoom(true);
            // pomelo.request('hall.hallHandler.updateRealName', { realName: '卡卡西里', RegIPCountry:'江苏省无锡市'}, function (err, data) {
            //     console.log('---------------------', err, data);
            // });
            cb();
        }
    ], function (err) {
        callback(err, code);
    });
}

// 经典掼弹压力测试
function toRoom(enroll) {
    async.waterfall([
        function (cb) {
            let idx = parseInt(Math.random() * 100) % 6;
            let roomId = 1;
            var msg = { roomId };
            monitor(START, 'enterRoom', ActFlagType.ATTACK);
            pomelo.request("room.roomHandler.enterRoom", msg, function (err, data1) {
                console.log('enterRoom success');
                monitor(END, 'enterRoom', ActFlagType.ATTACK);
                cb();
            });
        },
        function (cb) {
            monitor(START, 'quickstart', ActFlagType.ATTACK);
            pomelo.request("room.roomHandler.quickstart", {}, function (err, data1) {
                console.log('enrollMonthlyGDMatch success');
                monitor(END, 'quickstart', ActFlagType.ATTACK);
                cb();
            });
        },
        function (cb) {
            monitor(START, 'ready', ActFlagType.ATTACK);
            pomelo.request("room.roomHandler.onReady", {}, function (err, data1) {
                console.log('onReady success');
                monitor(END, 'ready', ActFlagType.ATTACK);
                cb();
            });
        },

    ], function (err) {
        console.log('---enterTable-end-err-', err);
    });
}

pomelo.on('onGameEnd', function (res) {
    if (res.isRoundEnd) {
        setTimeout(function () {
            toRoom(false);
        }, 100);
    }
})

// pomelo.on('toReady', function (res) {
//     console.log('--------------------------wangming------------------------')
//     monitor(START, 'toReady', ActFlagType.ATTACK);
//     pomelo.request(readyMethod, { matchId, matchType}, function (err, data1) {
//         console.log('toReady success');
//         monitor(END, 'toReady', ActFlagType.ATTACK);
//     });
// })

simulateRealPlayer();



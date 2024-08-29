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
        // queryEntry(user);
        entry(user)
    })
}

function queryEntry(user) {
    var result = {};
    var gatePort = 3014;

    async.waterfall([
        function (cb) {
            // 47.111.75.80
            pomelo.init({ host: '192.168.1.242', port: gatePort }, function (err) {
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

function entry(user, callback) {
    var entryData;

    var code;
    async.waterfall([
        function (cb) {
            pomelo.init({ host: "192.168.1.241", port: 3901 }, function (err) {
                // console.warn('entry init error:',err);
                monitor(START, 'entry', ActFlagType.ENTRY);
                cb(err);
            });
        },
        function (cb) {
            console.log(user.password);

            var msg = { clientType: 'app', userName: user.userName, password: user.password, mode: 2, deviceID: Math.random().toString(36).substr(2), isReconnect: false };
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
            toHall(entryData);
            // pomelo.request('hall.hallHandler.updateRealName', { realName: '卡卡西里', RegIPCountry:'江苏省无锡市'}, function (err, data) {
            //     console.log('---------------------', err, data);
            // });
            cb();
        }
    ], function (err) {
    });
}

function toHall(data) {
    var entryData;
    async.waterfall([
        function (cb) {
            var msg = { clientType: 'app' };
            monitor(START, 'enterHall', ActFlagType.ENTER_SCENE);
            pomelo.request('hall.hallHandler.enterHall', msg, function (err, data) {
                entryData = data;
                console.log('enterHall success');
                monitor(END, 'enterHall', ActFlagType.ENTER_SCENE);
                cb();
            });
        },
        function (cb) {
            toRoom(true);
            cb();
        }
    ], function (err) {

    });
}
var matchId = 0;

function testusercount() {
    // setInterval(function () {
    //     pomelo.request("hall.hallHandler.syncUserCount", { matchId: matchId }, function (err, data1) {
    //         console.log('---------------', data1)
    //     });
    // }, 10000);
}

var roomids = 7;
var matchType = 12;
// var enterMethod = 'hall.hallHandler.enterRegularMatchRoom';
var enrollMethod = 'hall.hallHandler.enrollRegularGDMatch';
var readyMethod = 'hall.hallHandler.regularMatchReady';
var enterMethod = "hall.hallHandler.enterZJFreeModeMatch"
// var roomids = 52;
// var matchType = 12;
// var enterMethod = 'hall.hallHandler.enterMonthlyMatchRoom';
// var enrollMethod = 'hall.hallHandler.enrollMonthlyGDMatch'; 
// var readyMethod = 'hall.hallHandler.monthlyMatchReady';

//四轮
// var roomids = 50;
// var matchType = 7;
// var enterMethod = 'hall.hallHandler.enterRegularMatchRoom';
// var enrollMethod = 'hall.hallHandler.enrollRegularGDMatch';
// var readyMethod = 'hall.hallHandler.regularMatchReady';

//淘汰赛
// var roomids = 52;
// var matchType = 12;
// var enterMethod = 'hall.hallHandler.enterRegularMatchRoom';
// var enrollMethod = 'hall.hallHandler.enrollRegularGDMatch';
// var readyMethod = 'hall.hallHandler.regularMatchReady';
matchId = 4751;
pomelo.on('taoTai', function (res) {
    console.log('--------------------------wangming------------------------')
    monitor(START, 'substituteTaoTaiMatch', ActFlagType.ATTACK);
    pomelo.request('hall.hallHandler.substituteTaoTaiMatch', { matchId: res.matchId, matchType }, function (err, data1) {
        console.log('substituteTaoTaiMatch success');
        monitor(END, 'substituteTaoTaiMatch', ActFlagType.ATTACK);
    });
})

// 经典掼弹压力测试
function toRoom(enroll) {
    async.waterfall([
        function (cb) {
            let idx = parseInt(Math.random() * 100) % 6;
            let roomId = roomids;
            var msg = { clientType: 'app', matchType, matchId };
            monitor(START, 'enterRoom', ActFlagType.ATTACK);
            pomelo.request(enterMethod, msg, function (err, data1) {
                // matchId = data1.msg.matchData.id;
                console.log('enterRoom success');
                monitor(END, 'enterRoom', ActFlagType.ATTACK);
                testusercount();
                cb();
            });
        },
        function (cb) {
            if (enroll) {
                monitor(START, 'enrollMonthlyGDMatch', ActFlagType.ATTACK);
                pomelo.request(enrollMethod, { matchId }, function (err, data1) {
                    console.log('enrollMonthlyGDMatch success');
                    monitor(END, 'enrollMonthlyGDMatch', ActFlagType.ATTACK);
                    cb();
                });
            }
            else {
                cb();
            }
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

pomelo.on('toReady', function (res) {
    console.log('--------------------------wangming------------------------')
    monitor(START, 'toReady', ActFlagType.ATTACK);
    pomelo.request(readyMethod, { matchId, matchType }, function (err, data1) {
        console.log('toReady success');
        monitor(END, 'toReady', ActFlagType.ATTACK);
    });
})

simulateRealPlayer();



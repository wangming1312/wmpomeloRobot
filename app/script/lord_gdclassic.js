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
    userManager.getUser(function (user) {
        if (!user) {
            return console.log('no user');
        }
        logInfo.info("---username----" + user.userName);
        queryEntry(user);
    })
}

function queryEntry(user) {
    var result = {};
    var gatePort = 3014;

    async.waterfall([
        function (cb) {
            // 47.96.127.191
            pomelo.init({ host: '192.168.1.242', port: gatePort}, function (err) {
                cb(err);
            });
        },
        function (cb) {
            pomelo.request('gate.gateHandler.queryEntry', {uid: user.id}, function (err, data) {
                //pomelo.disconnect();

                if(!!data){
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
            entry(result.host, result.port, user, function (err,code) {
                cb(err);
            })
        }
    ],function () {

    });
}

function entry(host, port, user, callback) {
    var entryData;

    var code ;
    async.waterfall([
        function (cb) {
            pomelo.init({host: host, port: port}, function (err) {
                // console.warn('entry init error:',err);
                monitor(START, 'entry', ActFlagType.ENTRY);
                cb(err);
            });
        },
        function (cb) {
            console.log(user.password);
            
            var msg = { clientType: 'pc',userName: user.userName, password: user.password, mode: 2, deviceID: Math.random().toString(36).substr(2), isReconnect: false };
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
            cb();
        }
    ],function (err) {
        callback(err,code);
    });
}

function toHall(data) {
    var entryData;
    async.waterfall([
        function (cb) {
            var msg = { clientType: 'pc' };
            monitor(START, 'enterHall', ActFlagType.ENTER_SCENE);
            pomelo.request('hall.hallHandler.enterHall', msg, function (err, data) {
                entryData = data;
                console.log('enterHall success');
                monitor(END, 'enterHall', ActFlagType.ENTER_SCENE);
                cb();
            });
        },
        function (cb) {
            toRoom(entryData);
            cb();
        }
    ],function (err) {

    });
}
var roomids = 14;
// 经典掼弹压力测试
function toRoom(data) {
    async.waterfall([
        function (cb) {
            let idx = parseInt(Math.random() * 100) % 6;
            // let roomId = roomids[idx];
            let roomId = roomids;
            var msg = { roomId, clientType: 'pc'};
            monitor(START, 'enterRoom', ActFlagType.ATTACK);
            pomelo.request('gdClassic.gdClassicHandler.enterRoom', msg, function (err, data1) {
                entryData = data1;
                console.log('enterRoom success');
                
                // console.log('---entryData---' + JSON.stringify(entryData));
                monitor(END, 'enterRoom', ActFlagType.ATTACK);
                cb();
            });
        },
        function (cb) {
            let idx = parseInt(Math.random() * 100) % 6;
            let roomId = roomids;
            var msg = { clientType: 'pc',roomId: roomId, tableConfig: { canBeLook: true, passLevel: 5, tablePwd: '' }};
            console.log('---quickStart---');
            monitor(START, 'quickStart', ActFlagType.MOVE);
            pomelo.request('gdClassic.gdClassicHandler.quickStart', msg, function (err, data2) {
                monitor(END, 'quickStart', ActFlagType.MOVE);
                console.log('---quickStart-success--' + JSON.stringify(data2));
                if (data2.code == 200) {
                    console.log('---ready---');
                    monitor(START, 'ready', ActFlagType.MOVE);
                    pomelo.request('gdClassic.gdClassicHandler.ready', {}, function (err, data2) {
                        if (data2.code == 200) {
                            console.log('ready success');
                            monitor(END, 'ready', ActFlagType.MOVE);
                        }
                    });
                }
                cb();
                
            });
        },
        
    ],function (err) {
        console.log('---enterTable-end-err-', err);
    });
}

pomelo.on('onRoundEnd', function (res) {
    console.log('-----------------onRoundEnd--------------------------');
    setTimeout(function () {
        console.log('-----------------onRoundEnd---111111111-----------------------');
        toRoom();
     }, 15000);
})

simulateRealPlayer();



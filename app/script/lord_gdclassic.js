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
    var gatePort = 3014;

    async.waterfall([
        function (cb) {
            // 47.111.75.80
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
let clientType = "pc";
let myuid = 0;
function entry(host, port, user, callback) {
    var entryData;
    if (Math.random() * 100 < 40) {
        clientType = 'app';
    }
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
            
            var msg = { clientType: clientType,userName: user.userName, password: user.password, mode: 2, deviceID: Math.random().toString(36).substr(2), isReconnect: false };
            pomelo.request('connector.entryHandler.login', msg, function (err, data) {
                if (err || data.code != 200) {
                    return console.log(err);
                }
                
                entryData = data;
                myuid = data.msg.user.id;
                    console.log('login success');
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
            var msg = { clientType: clientType };
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
let enterMark = true;
// 经典掼弹压力测试
function toRoom(data) {
    enterMark = false;
    async.waterfall([
        function (cb) {
            let idx = parseInt(Math.random() * 100) % 6;
            // let roomId = roomids[idx];
            let roomId = roomids;
            var msg = { roomId, clientType: clientType};
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
            var msg = { clientType: clientType,roomId: roomId, tableConfig: { canBeLook: true, passLevel: 5, tablePwd: '' }};
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
                        else {
                            setTimeout(function () {
                                console.log('-----------------onRoundEnd---111111111-----------------------');
                                if (enterMark) {
                                    toRoom();
                                }
                            }, 5000);
                        }
                    });
                }
                else {
                    setTimeout(function () {
                        console.log('-----------------onRoundEnd---111111111-----------------------');
                        if (enterMark) {
                            toRoom();
                        }
                    }, 5000);
                }
                cb();
                
            });
        },
        
    ],function (err) {
        console.log('---enterTable-end-err-', err);
    });
}

pomelo.on('onRoundEnd', function (res) {
    enterMark = true;
    console.log('-----------------onRoundEnd--------------------------');
    setTimeout(function () {
        console.log('-----------------onRoundEnd---111111111-----------------------');
        if (enterMark) {
            toRoom();
        }
     }, 50);
})

pomelo.on('onPlayerLeave', function (res) {
    let uids = res.uids;
    for (let i = 0; i < uids.length; i++){
        if (uids[i] == myuid) {
            enterMark = true;
            setTimeout(function () {
                console.log('-----------------onRoundEnd---111111111-----------------------');
                if (enterMark) {
                    toRoom();
                }
            }, 50);
            break;
        }
    }
    
})

pomelo.on('callPcMsg', function (res) {
    console.log('-----------------callPcMsg---111111111-----------------------', res);

})

simulateRealPlayer();



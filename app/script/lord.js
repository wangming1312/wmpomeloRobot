var cwd = process.cwd();
//海选房间压力测试
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
        //logInfo.info("---username----" + user.userName);
        queryEntry(user);
    })
}

function queryEntry(user) {
    var result = {};
    var gatePort = 3014;

    async.waterfall([
        function (cb) {
            // 47.96.127.191
            pomelo.init({host: '192.168.1.242', port: gatePort}, function (err) {
                cb(err);
            });
        },
        function (cb) {
            pomelo.request('gate.gateHandler.queryEntry', {uid: user.id+''}, function (err, data) {
                //pomelo.disconnect();

                if(!!data){
                    result = data;
                }
                if (data.code === 2001) {
                    console.log('Servers error!');
                    return;
                }
                //console.log('queryEntry success');
                
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
var entryData;
function entry(host, port, user, callback) {
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
            //console.log(user.password);
            
            var msg = { userName: user.userName, password: user.password, mode: 2, deviceID: Math.random().toString(36).substr(2), isReconnect: false };
            pomelo.request('connector.entryHandler.login', msg, function (err, data) {
                if (err || data.code != 200) {
                    return console.log(err);
                }
                //console.log('login success');
                entryData = data.msg.user;
                monitor(END, 'entry', ActFlagType.ENTRY);
                if (data.msg.userStatus && data.msg.userStatus.gameType && data.msg.userStatus.gameType != "hall") {
                    var gameType = data.msg.userStatus.gameType;
                    let url = gameType + '.' + gameType + 'Handler.reconnect';
                    pomelo.request(url, {}, function (err, data) {
                        console.log('-------------------', err, data)
                     })
                }
                else {
                    toHall(entryData);
                }
            });
            cb();
        },
    ],function (err) {
        callback(err,code);
    });
}

function toHall(data) {

    async.waterfall([
        function (cb) {
            var msg = { clientType: 'app' };
            monitor(START, 'enterHall', ActFlagType.ENTER_SCENE);
            pomelo.request('hall.hallHandler.enterHall', msg, function (err, data) {
                if (data.code != 200) {
                    return console.log(err);
                }
                //console.log('enterHall success');
                monitor(END, 'enterHall', ActFlagType.ENTER_SCENE);
                cb();
            });
        },
        function (cb) {
            toRoom(data);
            cb();
        }
    ],function (err) {

    });
}

function toRoom(data) {
    //console.log('------------', data)
    async.waterfall([
        function (cb) {
            var msg = { clientType: 'app' };
            monitor(START, 'enterMatchRoom', ActFlagType.ATTACK);
            pomelo.request('hall.hallHandler.enterMatchRoom', msg, function (err, data1) {
                if (data1.code == 200) {
                    //console.log('enterMatchRoom success');
                    //console.log('---entryData---' + JSON.stringify(data1));
                    monitor(END, 'enterMatchRoom', ActFlagType.ATTACK);
                    var msg = { uid: data.id, userName: data.userName, nickName: data.nickName, selectTV: 1 };
                    //console.log('-------0----', msg)
                    monitor(START, 'selectTV', ActFlagType.MOVE);
                    //console.log('-------1----', msg)
                    pomelo.request('hall.hallHandler.selectTV', msg, function (err, data2) {
                        //console.log('-------2----', data2)
                        if (data2.code == 200 || data2.code ==  20012) {
                            //console.log('selectTV success');
                            monitor(END, 'selectTV', ActFlagType.MOVE);
                            //console.log('---enterTable-end--' + JSON.stringify(data2));
                            var msg2 = { roomId: 2 };
                            monitor(START, 'enrollGeneralGDMatch', ActFlagType.MOVE);
                            pomelo.request('hall.hallHandler.enrollGeneralGDMatch', msg2, function (err, data2) {
                                //console.log('-------3---', data2)
                                if (data2.code == 200) {
                                    //console.log('enrollGeneralGDMatch success');
                                    monitor(END, 'enrollGeneralGDMatch', ActFlagType.MOVE);
                                    // console.log('---enterTable-end--' + JSON.stringify(data2));
                                    cb();
                                }

                            });
                        }

                    });
                }
                
            });
        },
    ],function (err) {
        //console.log('---enterTable-end-err-', err);
    });
}
pomelo.on('toEnterTable', function(res){
    pomelo.request('gdMatch.gdMatchHandler.enterTable', {}, function (err, data2) {
        //console.log('-----------sss-------------', data2);
    });
})

pomelo.on('onGameEnd', function (res) {
    setTimeout(function () {
        toHall(entryData);
     }, 10000);
})

pomelo.on('onOutCard', function (res) {
    if (Math.random() * 100 < 10) {
    //    pomelo.disconnect(); 
    }
})

simulateRealPlayer();



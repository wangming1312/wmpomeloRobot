var Pomelo = require("pomelo-nodejsclient-websocket");

var pomelo = new Pomelo();

pomelo.init({host: '192.168.1.56', port: 3014}, function (err) {
  pomelo.request('gate.gateHandler.queryEntry', {}, function (err, data) {
    pomelo.disconnect()
    pomelo.init({host: data.host, port: data.port}, function (err) {
      pomelo.request('connector.entryHandler.login', 
        { userName: 'pre116', password: '112233', mode: 2, deviceID: Math.random().toString(36).substr(2), isReconnect: false }, function (err, data) {
        
          // pomelo.request('gdMatch.gdMatchHandler.reportMatch', {}, function (err, data) {
          //   console.log(data);
          // });
          pomelo.request('hall.hallHandler.enterMonthlyMatchRoom', {}, function (err, data) {
            console.log(data);
          });
      });
    });
  });
});
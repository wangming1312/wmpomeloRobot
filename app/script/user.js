/**
 * Created by lixiaodong on 17/3/4.
 */
var cwd = process.cwd();
var mysql = require('mysql');
var queryUsers = require(cwd + '/app/data/mysql').queryUsers;
var client = mysql.createConnection({
    "host": "127.0.0.1",
    "port": "3306",
    "database": "guandan2",
    "user": "root",
    "password": "1234"
});

function UserManager() {
    this.index = 5100;
    this.users = [];
    // this.index = 0;
    // this.users = [
    //     { userName: "pre0004", password: "987654" },
    //     { userName: "pre00078", password: "987654" },
    //     { userName: "pre001", password: "987654" },
    //     { userName: "pre0017", password: "987654" },
    //     { userName: "pre002", password: "987654" },
    //     { userName: "pre0020", password: "987654" },
    //     { userName: "pre003", password: "987654" },
    //     { userName: "pre004", password: "987654" },
    //     { userName: "pre005", password: "987654" },
    //     { userName: "pre006", password: "987654" },
    //     { userName: "pre007", password: "987654" },
    //     { userName: "pre007008", password: "987654" },
    //     { userName: "pre008", password: "987654" },
    //     { userName: "pre009", password: "987654" },
    //     { userName: "pre010", password: "987654" },
    //     { userName: "pre011", password: "987654" },
    //     { userName: "pre080", password: "987654" },
    //     { userName: "pre081", password: "987654" },
    //     { userName: "pre082", password: "987654" },
    //     { userName: "pre083", password: "987654" },
    //     { userName: "pre084", password: "987654" },
    //     { userName: "pre085", password: "987654" },
    //     { userName: "pre086", password: "987654" },
    //     { userName: "pre087", password: "987654" },
    //     { userName: "pre088", password: "987654" },
    //     { userName: "pre089", password: "987654" },
    //     { userName: "pre090", password: "987654" },
    //     { userName: "pre091", password: "987654" },
    //     { userName: "pre092", password: "987654" },
    //     { userName: "pre093", password: "987654" },
    //     { userName: "pre094", password: "987654" },
    //     { userName: "pre095", password: "987654" },
    //     { userName: "pre096", password: "987654" },
    //     { userName: "pre097", password: "987654" },
    //     { userName: "pre098", password: "987654" },
    //     { userName: "pre099", password: "987654" }
    // ];
    this.fromidx = 10;
}

UserManager.prototype.getUser = function (cb) {
    this.index++;

    if (this.users.length > 0) {
        if (this.index <= this.users.length) {
            cb(this.users[this.index]);
        } else {
            cb(null)
        }
    } else {
        queryUsers(client, (err, users) => {
            if (err) {
                console.log('query user err');
            }
            this.users = [...users];
            if (this.index <= this.users.length) {
                cb(this.users[this.index]);
            } else {
                cb(null)
            }
        })
    }
}

UserManager.prototype.getUserlocal = function (cb) {
    cb({ userName: `gdwmtest${this.fromidx}`, password: '112233' })
    this.fromidx++;
}


module.exports = new UserManager();
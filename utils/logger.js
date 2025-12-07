const chalk = require('chalk');
const moment = require('moment');
const fs = require('fs');
const logPath = './logs/bot.log';

if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
}

module.exports = {
    info: function(message) {
        console.log(chalk.white(`[INFO] ${message}`));
        fs.appendFileSync(logPath, `[INFO] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}\n`);
    },
    warn: function(message) {
        console.warn(chalk.yellow(`[WARN] ${message}`));
        fs.appendFileSync(logPath, `[WARN] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}\n`);
    },
    error: function(message) {
        console.error(chalk.red(`[ERROR] ${message}`));
        fs.appendFileSync(logPath, `[ERROR] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}\n`);
    },
    debug: function(message) {
        console.log(chalk.blue(`[DEBUG] ${message}`));
        fs.appendFileSync(logPath, `[DEBUG] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}\n`);
    },
    cmd: function(message) {
        console.log(chalk.magenta(`[CMD] ${message}`));
        fs.appendFileSync(logPath, `[CMD] ${moment().format('YYYY-MM-DD HH:mm:ss')} ${message}\n`);
    }
};

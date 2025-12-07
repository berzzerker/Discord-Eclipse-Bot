const chalk = require('chalk');

const logger = {
    info: (message) => {
        console.log(chalk.default.blue(`[INFO] ${message}`));
    },
    warn: (message) => {
        console.log(chalk.default.yellow(`[WARN] ${message}`));
    },
    error: (message, error) => {
        console.error(chalk.default.red(`[ERROR] ${message}`));
        if (error) {
            console.error(error);
        }
    },
};

module.exports = logger;

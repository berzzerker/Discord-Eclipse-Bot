const chalk = require('chalk');

const logger = {
    info: (message) => {
        console.log(chalk.blue(`[INFO] ${message}`));
    },
    warn: (message) => {
        console.log(chalk.yellow(`[WARN] ${message}`));
    },
    error: (message, error) => {
        console.error(chalk.red(`[ERROR] ${message}`));
        if (error) {
            console.error(error);
        }
    },
};

module.exports = logger;

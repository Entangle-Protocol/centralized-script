import chalk from 'chalk';

// eslint-disable-next-line
type Logger = (...data: any[]) => void;

// eslint-disable-next-line
export function log(log: Logger, ...data: any[]) {
    log(
        chalk.green(
            `[${
                new Date().getFullYear() +
                '-' +
                new Date().getMonth() +
                '-' +
                new Date().getDay() +
                ' ' +
                new Date().getHours() +
                ':' +
                new Date().getMinutes() +
                ':' +
                new Date().getSeconds() +
                ':' +
                new Date().getMilliseconds()
            }]`
        ),
        ...data
    );
}

// eslint-disable-next-line
export function chainLog(_log: Logger, chainId: number, ...data: any[]) {
    switch (chainId) {
        case 1: {
            log(_log, `[${chalk.yellow('TestBSC')}]`, ...data);
            break;
        }
        case 2: {
            log(_log, chalk.blueBright('TestETH'), ...data);
            break;
        }
        case 3: {
            log(_log, `[${chalk.red('TestAvax')}]`, ...data);
            break;
        }
        case 43114: {
            log(_log, chalk.red('Avalanche'), ...data);
            break;
        }
        case 250: {
            log(_log, chalk.blue('Fantom'), ...data);
            break;
        }
        case 56: {
            log(_log, chalk.yellow('BSC'), ...data);
            break;
        }
        default: {
            log(_log, ...data);
        }
    }
}

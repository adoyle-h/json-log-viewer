'use strict';

const FS = require('fs-extra');
const opts = require('minimist')(process.argv.slice(2));
const TUI = require('./tui');
const chalk = require('chalk');

async function run() {
    const logFile = opts._[0];

    if (!logFile) {
        // eslint-disable-next-line no-console
        console.log('error: missing log file');
        process.exit(1);
    }

    const existed = await FS.pathExists(logFile);
    if (!existed) {
        throw new Error('log file does not exist');
    }

    const config = {
        main: {
            level: opts.l || opts.level,
            sort: opts.s || opts.sort,

            levelColors: {
                debug: (s) => `{blue-fg}${s}{/blue-fg}`,
                verb: (s) => `{cyan-fg}${s}{/cyan-fg}`,
                info: (s) => `{green-fg}${s}{/green-fg}`,
                notice: (s) => `{green-fg}${s}{/green-fg}`,
                warn: (s) => `{yellow-fg}${s}{/yellow-fg}`,
                error: (s) => `{red-fg}${s}{/red-fg}`,
            },
        },
        logFile,
        log: opts.log,
    };

    const tui = new TUI(config);
    await tui.start();
}

run().catch((err) => {
    console.error(err.stack);
});

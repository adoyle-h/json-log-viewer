'use strict';

const blessed = require('blessed');

const MainPanel = require('./widgets/MainPanel');
const StatusLine = require('./widgets/StatusLine');

/**
 * Terminal UI
 */
class TUI {
    /**
     * @param {Object} config
     */
    constructor(config) {
        this.config = config;

        const screen = blessed.screen({
            smartCSR: true,
            log: config.log,
        });
        this.screen = screen;

        const mainPanel = new MainPanel(config.main, screen, config.main);
        mainPanel.loadFile(config.logFile);
        // mainPanel.setCurrent();
        this.mainPanel = mainPanel;

        const statusLine = new StatusLine({screen, mainPanel});
        this.statusLine = statusLine;

        screen.append(statusLine);
    }

    async start() {
        const {screen} = this;

        process.on('SIGWINCH', () => {
            screen.emit('resize');
        });

        return new Promise((resolve) => {
            screen.key(['C-c'], (_ch, _key) => {
                resolve();
            });
        });
    }
}

module.exports = TUI;

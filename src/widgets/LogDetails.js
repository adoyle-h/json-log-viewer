'use strict';

const blessed = require('blessed');
const _ = require('lodash');

const BaseWidget = require('./BaseWidget');

const fmtKey = (rawKey, padding = undefined) => {
    const key = padding
        ? `${rawKey}:`.padEnd(padding + 1)
        : `${rawKey}:`;
    return `{blue-fg}{bold}${key}{/bold}{/blue-fg}`;
};
const fmtVal = (val) => ` ${val}`;

const spaces = (s, len) => new Array(len).join(' ') + s;

const formatEntry = (key, val, padding = undefined, level = 0) => {
    const value = _.isObject(val)
        // eslint-disable-next-line no-use-before-define
        ? formatObject(val, level + 1)
        : fmtVal(val);
    return `${fmtKey(key, padding)}${value}`;
};

const formatObject = (obj, level = 0) => {
    const padding = Math.max(...Object.keys(obj).map((k) => k.length));
    const entries = Object.keys(obj)
        .map((key) => `${formatEntry(key, obj[key], padding, level)}`)
        .map((val) => spaces(val, level * 2));
    return [''].concat(entries).join('\n');
};

class LogDetails extends BaseWidget {
    constructor(opts = {}) {
        super({...opts, width: '90%',
            height: '80%',
            shadow: true,
            handleKeys: true});
        this.json = false;
    }

    moveUp() {
        const {el} = this;
        el.scroll(-1);
        this.screen.render();
    }

    moveDown() {
        const {el} = this;
        el.scroll(1);
        this.screen.render();
    }

    pageDown() {
        const {el} = this;
        el.scroll(el.getScrollHeight());
        this.screen.render();
    }

    pageUp() {
        const {el} = this;
        el.scroll(-el.getScrollHeight());
        this.screen.render();
    }

    pageHalfDown() {
        const {el} = this;
        el.scroll(parseInt(el.getScrollHeight() / 2));
        this.screen.render();
    }

    pageHalfUp() {
        const {el} = this;
        el.scroll(-parseInt(el.getScrollHeight() / 2));
        this.screen.render();
    }

    moveToLine(num) {
        this.row = num;
        this.initialRow = num;
        this.renderLines();
    }

    lastPage() {
        this.row = this.lastRow;
        this.initialRow = this.row - this.pageHeight;
        this.renderLines();
    }

    handleKeyPress(ch, key) {
        if (ch === 'q' || key.name === 'enter' || key.name === 'escape') {
            this.log('detach');
            this.el.detach();
            this.detach();
            this.screen.render();
            return;
        }

        if (ch === 'j' || key.name === 'down') {
            this.moveDown();
            return;
        }
        if (ch === 'k' || key.name === 'up') {
            this.moveUp();
            return;
        }

        if (key.ctrl) {
            if (key.name === 'd') {
                this.pageHalfDown();
                return;
            }
            if (key.name === 'u') {
                this.pageHalfUp();
                return;
            }
            if (key.name === 'f') {
                this.pageDown();
                return;
            }
            if (key.name === 'b') {
                this.pageUp();
                return;
            }
        }
        if (key.name === 'pagedown') {
            this.pageDown();
            return;
        }
        if (key.name === 'pageup') {
            this.pageUp();
            return;
        }

        if (ch === 'g') {
            if (this._doubleG) {
                this._doubleG = false;
                this.moveToLine(0);
            } else {
                this._doubleG = true;
                setTimeout(() => {
                    this._doubleG = false;
                }, 1000);
            }
            return;
        }
        if (ch === 'G') {
            this.lastPage();
            return;
        }

        if (key.name === 'tab') {
            this.json = !this.json;
            this.update();
        }
    }

    display(entry) {
        this.setLabel(`{bold} ${entry.timestamp} - ${entry.level} {/}`);
        this.entry = entry.data;
        this.update();
    }

    update() {
        if (this.el) {
            this.el.detach();
            this.el = null;
        }

        const content = this.json
            ? JSON.stringify(this.entry, null, 2)
            : formatObject(this.entry);

        this.el = blessed.element({
            scrollable: true,
            alwaysScroll: true,
            keys: true,
            scrollbar: {ch: ' ', track: {bg: 'grey'}, style: {bg: 'yellow'}},
            tags: true,
            content,
        });
        this.el.on('keypress', this.handleKeyPress.bind(this));
        this.el.focus();

        this.append(this.el);
        this.screen.render();
    }
}

module.exports = LogDetails;

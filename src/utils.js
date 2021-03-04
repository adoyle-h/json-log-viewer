'use strict';

const _ = require('lodash');

const COLOR_TAG_REGEX = /{\/?[\w\-,;!#]+}/g;

const stripColors = (text) => {
    return (text || '').replace(COLOR_TAG_REGEX, '').replace(/\{\/}/g, '');
};

const len = (text, ignoreColors = false) => {
    if (!text) {
        return 0;
    }
    if (ignoreColors) {
        return text.length;
    }
    return stripColors(text).length;
};

const maxLengths = (columns, arr, spacing, maxWidth) => {
    const lengths = arr.reduce((map, row) => {
        columns.slice(0, -1).forEach((col) => {
            const val = row[col.key] || '';
            map[col.key] = col.length || Math.max(map[col.key] || 0, len(val.toString()));
        });
        return map;
    }, {});
    const lastCol = _.last(columns);
    const width = _.chain(lengths).values().sum().value() + (spacing * Object.keys(lengths).length);
    lengths[lastCol.key] = maxWidth - width;
    return lengths;
};

const hasColors = (text) => {
    return COLOR_TAG_REGEX.test(text);
};

const spaces = (n) => new Array(n + 1).join(' ');

const trunc = (text, length, ignoreColors = false) => {
    if (!text) { return ''; }
    if (ignoreColors || !hasColors(text)) {
        return text.substring(0, length);
    }
    if (len(text, ignoreColors) <= length) {
        return text;
    }

    let curLen = 0;
    let isTag = false;
    let output = '';
    let i = 0;
    while (curLen < length) {
        const ch = text.charAt(i);
        output += ch;
        if (ch === '{') {
            isTag = true;
        }
        if (!isTag) {
            curLen += 1;
        }
        if (ch === '}') {
            isTag = false;
        }
        i += 1;
    }

    return `${output}{/}`;
};

const padEnd = (text, length, ignoreColors = false) => {
    const nSpaces = length - len(text, ignoreColors);
    if (nSpaces < 0) {
        return trunc(text, length, ignoreColors);
    }
    return `${text}${spaces(nSpaces)}`;
};

const formatRows = (rows, columns, spacing, maxWidth) => {
    const lengths = maxLengths(columns, rows, spacing, maxWidth);
    return rows.map((row) => {
        return columns.map((column) => {
            const {format, key} = column;
            const rawValue = row[key];

            try {
                const value = _.isFunction(format) ? format(rawValue) : rawValue;
                return padEnd(value, lengths[key], !format);
            } catch(err) {
                return rawValue;
            }
        }).join(spaces(spacing));
    });
};

module.exports = {
    formatRows, maxLengths, hasColors, stripColors, spaces, padEnd, len, trunc,
};

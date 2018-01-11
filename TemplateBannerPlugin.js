/*!
 * (c) 2018 Hamed Ehtesham
 * Released under the MIT License.
 */

"use strict";

const BannerPlugin = require('webpack/lib/BannerPlugin');

const regex = /{([\w\d.[\]]+)}/gm;
const str = `{name}
(c) 2017-{year} {author}
{keywords[1]}
{keywords.bugs}
Released under the {license} License.`;

const matches = (regex, str) => {
    let _match;
    let _matches = [];

    while ((_match = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (_match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `_match`-variable.
        _matches.push(_match);
        // _match.forEach((match, groupIndex) => {
        //     console.log(`Found _match, group ${groupIndex}: ${match}`);
        // });
    }

    return _matches;
};

class TemplateBannerPlugin {
    constructor(options) {
        let path = options.path || './';
        let filename = options.filename || 'package.json';

        let data = require(path + filename) || {};

        const defaults = require('lodash/fp/defaults');
        data = defaults(data)(options.default);

        let banner = options.banner;

        let m = matches(regex, banner);
        let paths = m.map(m => m[1]);

        let unique = require('lodash/fp/uniq');
        let uPaths = unique(paths);

        let get = require('lodash/fp/get');

        const escapeStringRegexp = require('escape-string-regexp');

        uPaths.forEach(path => {
            let value = get(path)(data);
            console.log(path, value);

            let str = escapeStringRegexp(`{${path}}`);
            let regexp = new RegExp(str, 'g');
            banner = banner.replace(regexp, value || '');
        });

        options.banner = banner;
        this.options = options;

        console.log(this.options);
    }

    apply(compiler) {
        new BannerPlugin(this.options).apply(compiler);
    }
}

module.exports = TemplateBannerPlugin;
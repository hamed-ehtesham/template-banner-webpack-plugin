const defaults = require('lodash/fp/defaults');
const unique = require('lodash/fp/uniq');
const get = require('lodash/fp/get');

const fs = __non_webpack_require__('fs');
const path = __non_webpack_require__('path');
let _rootDir;

const getRootDir = () => {
    if (_rootDir === undefined) {
        let NODE_MODULES = path.sep + 'node_modules' + path.sep;
        let cwd = process.cwd();
        let pos = cwd.indexOf(NODE_MODULES);

        if (pos !== -1) {
            _rootDir = cwd.substring(0, pos);
        } else if (fs.existsSync(path.join(cwd, 'package.json'))) {
            _rootDir = cwd;
        } else {
            pos = __dirname.indexOf(NODE_MODULES);
            if (pos === -1) {
                _rootDir = path.normalize(path.join(__dirname, '..'));
            } else {
                _rootDir = __dirname.substring(0, pos);
            }
        }
    }

    return _rootDir;
};

const getFileDir = (dirs, filename) => {
    for (let index = 0; index < dirs.length; ++index) {
        let dir = dirs[index];
        if (dir && filename && fs.existsSync(path.join(dir, filename)))
            return dir;
    }
};

const matches = (regex, str) => {
    let _match;
    let _matches = [];

    while ((_match = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (_match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        _matches.push(_match);
    }

    return _matches;
};

const interpolate = (regex, groupIndex, banner, data) => {
    let m = matches(regex, banner);
    let paths = m.map(m => m[groupIndex]);

    let uPaths = unique(paths);

    uPaths.forEach(path => {
        let value = get(path)(data);

        banner = banner.replace(regex, (match, ...groups) => {
            if (groups[groupIndex - 1] === path)
                return value || '';
            return match;
        });
    });

    return banner;
};

const wrapComment = str => {
    if (!str.includes("\n")) return `/*! ${str} */`;
    return `/*!\n * ${str.split("\n").join("\n * ")}\n */`;
};

const asRegExp = test => {
    if (typeof test === "string") test = new RegExp("^" + test.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
    return test;
};

class ModuleFilenameHelpers {
    static matchPart(str, test) {
        if (!test) return true;
        test = asRegExp(test);
        if (Array.isArray(test)) {
            return test.map(asRegExp).filter(function (regExp) {
                return regExp.test(str);
            }).length > 0;
        } else {
            return test.test(str);
        }
    }

    static matchObject(obj, str) {
        if (obj.test)
            if (!ModuleFilenameHelpers.matchPart(str, obj.test)) return false;
        if (obj.include)
            if (!ModuleFilenameHelpers.matchPart(str, obj.include)) return false;
        if (obj.exclude)
            if (ModuleFilenameHelpers.matchPart(str, obj.exclude)) return false;
        return true;
    }
}

let ConcatSource;
try {
    ConcatSource = __non_webpack_require__("webpack-core/lib/ConcatSource");
} catch (e) {
    ConcatSource = __non_webpack_require__("webpack-sources").ConcatSource;
}

// const ConcatSource = require('webpack-sources').ConcatSource;

class TemplateBannerPlugin {
    constructor(options) {
        if (arguments.length > 1)
            throw new Error("TemplateBannerPlugin only takes one argument (pass an options object)");
        if (typeof options === "string")
            options = {
                banner: options
            };

        this.options = options || {};
        this.banner = undefined;
    }

    apply(compiler) {
        const options = this.options;

        if (!this.banner) {
            let banner = options.banner || '{name} v{version}';

            let filename = options.filename || 'package.json';

            let rootDir = options.path;
            if (!rootDir) {
                let dirs = [path.normalize(path.resolve('.')), compiler.context];
                rootDir = getFileDir(dirs, filename);
            }
            let data;

            let filePath = path.join(rootDir, filename);
            if (!fs.existsSync(filePath))
                console.error(`TemplateBannerPlugin couldn't find ${filePath}`);

            data = __non_webpack_require__(filePath);

            if(typeof data === 'function')
                data = data();

            data = data || {};

            let opt;
            if (typeof options.default === 'function')
                opt = options.default(data);

            data = defaults(data)(opt || options.default);

            const regex = /{([\w\d.[\]]+)}/g;
            banner = interpolate(regex, 1, banner, data);

            banner = options.raw ? banner : wrapComment(banner);

            this.banner = options.banner = banner;
        }

        compiler.plugin("compilation", (compilation) => {
            compilation.plugin("optimize-chunk-assets", (chunks, callback) => {
                chunks.forEach((chunk) => {
                    if (options.entryOnly && !chunk.isInitial()) return;
                    chunk.files
                        .filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
                        .forEach((file) => {
                            let basename;
                            let query = "";
                            let filename = file;
                            const hash = compilation.hash;
                            const querySplit = filename.indexOf("?");

                            if (querySplit >= 0) {
                                query = filename.substr(querySplit);
                                filename = filename.substr(0, querySplit);
                            }

                            if (filename.indexOf("/") < 0) {
                                basename = filename;
                            } else {
                                basename = filename.substr(filename.lastIndexOf("/") + 1);
                            }

                            let regex = /<([\w\d.[\]]+)>/g;
                            let data = {
                                hash,
                                chunk,
                                filename,
                                basename,
                                query,
                            };
                            let banner = this.banner;
                            banner = interpolate(regex, 1, banner, data);

                            const comment = compilation.getPath(banner, data);

                            return compilation.assets[file] = new ConcatSource(comment, "\n", compilation.assets[file]);
                        });
                });
                callback();
            });
        });
    }
}

module.exports = TemplateBannerPlugin;
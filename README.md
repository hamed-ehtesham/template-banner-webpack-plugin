# TemplateBannerPlugin
[![node](https://img.shields.io/badge/node-%5E4.0.0-green.svg?style=flat-square)]()
[![node](https://img.shields.io/badge/webpack-%5E1.10.0-blue.svg?style=flat-square)]()

Adds the data of a package from `package.json` to the top of each generated chunk. (or from any other `json` or `js` file)

## Install
```bash
$ yarn add --dev template-banner-webpack-plugin
# or
$ npm i --save-dev template-banner-webpack-plugin
```

## Usage
Import the plugin module into webpack configuration.

```js
const TemplateBannerPlugin = require('template-banner-webpack-plugin');
```

Then use this plugin with some options.

```javascript
new TemplateBannerPlugin(banner)
// or
new TemplateBannerPlugin(options)
```

```js
new TemplateBannerPlugin({
    banner: `<filename>: <chunk.name> <chunk.ids> <hash> <chunk.hash>
{name} v{version}
(c) 2017-{year} {author}
Released under the {license}.`,
    default(data) {
        return {
            year: (new Date()).getFullYear(),
            license: `${data.license} License`
        };
    },
});
```

Then output files has template banner like this.
```js
/*!
 * input.js: main 0 add0afa23daa62148cae 9761215c7cb0ac58e442806feccefa72
 * pretty-checkbox-vue v1.1.2
 * (c) 2017-2018 Hamed Ehtesham
 * Released under the MIT License.
 */
```

If you have discovered a 🐜 or have a feature suggestion, feel free to create an [issue](https://github.com/hamed-ehtesham/template-banner-webpack-plugin/issues) on Github.

## Options
```
new TemplateBannerPlugin(options);
```

Name | Type | Default Value | Description
------------ | ------------- | ------------- | -------------
`banner` | String | '{name} v{version}' | the `banner` `template` as string, to add to the top of each generated chunk; it will be **wrapped in a comment**   
`raw` | Boolean | false | if `true`, banner **will not** be wrapped in a comment
`default` | Object or Function | | it is the **data** to be available in `banner` via `template`. any field that exist here would override the fields of `json` or `js` file. if it's a `function` data would be passed to it as an `object` like this `default(data)` then this function can manipulate the data and **return** the new data
`path` | String | | try to find your current directory or use webpack `context` to locate your filename and if fails to do that throws error
`filename` | String | 'package.json' | file to use for data could be `json` or `js` (should **exports** (`module.exports` (`commonjs2`)) an `object` or a `function` that returns an object)
`test` | String or RegExp or Array | | if the argument is a `string` it will be compared with the **whole** chunk's `filename`, `string` elements in array will do the same
`include` | String or RegExp or Array | | it's not the path; it works just like `test`  
`exclude` | String or RegExp or Array | | it's not the path; it works just like `test` but to exclude files instead of including theme

## Template
Use `{}` for all data from `default` values or `json` or `js` file

Use `<>` for all chunk specific data that is `<hash>`, `<chunk>`, `<filename>`, `<basename>`, `<query>`

Note that you can select json or js exported object properties like this: `{repository.url}` or `{keywords[0]}`, `{keywords[3]}`

Note that `<chunk>` is an object too that you can use its properties like `<chunk.name>`, `<chunk.ids[0]>` or `<chunk.hash>`

for more information about chunk properties [see this](https://github.com/webpack/webpack/blob/master/lib/Chunk.js)

### Removing all other comments

If you want to remove all other comments, use `uglifyjs-webpack-plugin`.

for more information about `uglifyjs-webpack-plugin` options [see this](https://webpack.js.org/plugins/uglifyjs-webpack-plugin/)

```bash
$ yarn add --dev uglifyjs-webpack-plugin
# or
$ npm install --save-dev uglifyjs-webpack-plugin 
```

```js
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
```

and also you **must** use it after UglifyJSPlugin.

```js
// ...
  plugins: [
    new UglifyJSPlugin(),
    new TemplateBannerPlugin()
  ]
// ...
```

## License
Released under The MIT [License](https://github.com/hamed-ehtesham/template-banner-webpack-plugin/blob/master/LICENSE). Copyright (c) hamed-ehtesham.

## Author
[Hamed Ehtesham](https://github.com/hamed-ehtesham)
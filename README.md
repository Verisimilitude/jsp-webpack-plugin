# Jsp WebPack Plugin
This plugin intends for generate *.jsp file (with injected your bundles and chunks)
This is the same WebPack Plugin as https://github.com/AkpoFlash/jsp-webpack-plugin but with typescript and types
# Install
`npm i --save-dev jsp-webpack-plugin-with-types`

or

`yarn add --dev jsp-webpack-plugin-with-types`

# Usage

**webpack.config.js**

```
const path = require('path');
const JspWebpackPlugin = require('jsp-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'index.js'),
    output: {
        path: path.resolve(__dirname, '/dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new JspWebpackPlugin({
            template: path.join(__dirname, '/src/index.jsp'),
            filename: path.join(__dirname, '/dist/index.jsp'),
        })
    ]
};
```

var path = require('path');
module.exports = {
    entry: './js/main.js',
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: path.join(__dirname, 'js'),
            loader: 'babel-loader'
        }]
    }
};
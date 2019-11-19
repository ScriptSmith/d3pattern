const path = require('path');

module.exports = {
    mode: "development",
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'main.js',
        publicPath: "/js",
        path: path.resolve(__dirname, 'dist')
    },
    devtool: "source-map"
};


const path = require('path');

module.exports = {
	output: {
		filename: 'tilda.admin.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			}
		]
	},
	watch: true
};
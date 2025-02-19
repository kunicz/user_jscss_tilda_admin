const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
	mode: 'production',
	output: {
		path: path.resolve(__dirname, '../'),
		filename: 'tilda_admin.js',
	},
	resolve: {
		alias: {
			'@helpers': path.resolve(__dirname, '../../@helpers'),
			'@root': path.resolve(__dirname, '../../')
		},
		extensions: ['.js', '.jsx', '.json'],  // Поддерживаем расширения
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									require('postcss-discard-comments')({
										removeAll: true,
									}),
								],
							},
						},
					}
				]
			}
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					format: {
						beautify: false,
						indent_level: 0,
						ascii_only: true
					}
				}
			})
		]
	},
	devtool: 'inline-source-map'
};
import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';
import postcssDiscardComments from 'postcss-discard-comments';
import SftpClient from 'ssh2-sftp-client';
import SftpUploadPlugin from '../../ftp.mjs';

const bundleName = 'tilda_admin.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolvedPath = path.resolve(__dirname, '../');
const sftpUploader = new SftpUploadPlugin({
	sftpClient: new SftpClient(),
	files: [{
		localFolder: resolvedPath,
		remoteFolder: 'jscss/user_jscss/',
		bundleName
	}]
});

export default {
	mode: 'production',
	entry: './src/index.js',
	output: {
		path: resolvedPath,
		filename: bundleName,
	},
	resolve: {
		alias: {
			'@helpers': path.resolve(__dirname, '../../@helpers/modules'),
			'@root': path.resolve(__dirname, '../../')
		},
		extensions: ['.js', '.jsx', '.json'],
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
									postcssDiscardComments({
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
	devtool: 'inline-source-map',
	plugins: [sftpUploader]
};
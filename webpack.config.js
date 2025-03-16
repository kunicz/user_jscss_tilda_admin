export default async () => {
	const { default: webpackConfig } = await import('../webpack.config.mjs');
	return webpackConfig(import.meta.url);
};
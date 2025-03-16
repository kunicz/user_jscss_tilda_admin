export default async () => {
	const { default: webpackConfig } = await import('../@npm/webpack.config.mjs');
	return webpackConfig(import.meta.url);
};
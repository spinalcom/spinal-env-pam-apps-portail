module.exports = {
	presets: [
		['@babel/preset-env', {targets: {node: 'current'}}],
		'@babel/preset-typescript',
	],
	plugins: [
		"babel-plugin-transform-scss",
		"@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread"
	]
};

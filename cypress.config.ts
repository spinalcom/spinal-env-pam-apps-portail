import {defineConfig} from 'cypress';

export default defineConfig({
	component: {
		devServer: {
			framework: 'vue-cli',
			bundler: 'webpack',
		},
	},
	env: {
		SPINAL_API_URL: 'http://localhost:2023',
	},
});
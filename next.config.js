/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	/**
	 * If you are using `appDir` then you must comment the below `i18n` config out.
	 *
	 * @see https://github.com/vercel/next.js/issues/41980
	 */
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	webpack: (config) => {
		config.module.rules.push({
			test: /\.woff2$/,
			type: "asset/resource",
		});
		return config;
	},
	transpilePackages: [
		"@codegouvfr/react-dsfr",
		"tss-react", // This is for MUI or if you use htts://tss-react.dev
	],
	experimental: {
		swcPlugins: [["superjson-next", { excluded: [] }]],
	},
};

export default config;

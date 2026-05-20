/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: [
		"@codegouvfr/react-dsfr",
		"tss-react", // This is for MUI or if you use htts://tss-react.dev
	],
	experimental: {
		swcPlugins: [["superjson-next", { excluded: [] }]],
	},
};

export default config;

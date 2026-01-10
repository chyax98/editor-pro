import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.js',
						'manifest.json'
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		rules: {
			// This project uses Chinese UI strings, so sentence-case rules are noisy.
			"obsidianmd/ui/sentence-case": "off",
			// Settings UI in this repo intentionally uses custom headings/emojis.
			"obsidianmd/settings-tab/no-manual-html-headings": "off",
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"tests",
		"__mocks__",
		"docs",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);

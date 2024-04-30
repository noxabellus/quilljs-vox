import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslint from "typescript-eslint";
// import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";


export default [
    {languageOptions: { globals: {...globals.browser, ...globals.node} }},
    pluginJs.configs.recommended,
    ...tsEslint.configs.recommended,
    // pluginReactConfig,
    {
        rules: {
            "camelcase": [
                "error",
                {
                    "ignoreImports": true,
                }
            ],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    "args": "all",
                    "argsIgnorePattern": "^_",
                    "caughtErrors": "all",
                    "caughtErrorsIgnorePattern": "^_",
                    "destructuredArrayIgnorePattern": "^_",
                    "varsIgnorePattern": "^_"
                }
            ],
            "semi": "error",
        }
    }
];
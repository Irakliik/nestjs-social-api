// import js from '@eslint/js';
// import globals from 'globals';
// import { defineConfig } from 'eslint/config';
// import tseslint from 'typescript-eslint';
// export default defineConfig([
//     {
//         rules: {
//             indent: ['error', 4],
//             quotes: ['error', 'single'],
//             semi: ['error', 'always'],
//             'linebreak-style': ['error', 'unix'],
//         },
//         files: ['src/**/*.{ts,tsx}'],
//         plugins: { js },
//         extends: ['js/recommended'],
//         languageOptions: { globals: { ...globals.node, ...globals.browser } },
//     },
// ]);

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: { ...globals.node, ...globals.browser },
        },
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'linebreak-style': ['error', 'unix'],
            '@typescript-eslint/no-empty-object-type': 'off',
        },
    },
]);

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
        ignores: ['server/', 'platforms/'],
        rules: {
            'no-unused-vars': 'error',
            'no-var': 'error',
            'prefer-const': 'error'
        }
    },
    { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } }
]);

import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import stylistic from '@stylistic/eslint-plugin';

export default withVueTs(
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.agents/**',
    ],
  },

  // recommended Vue rules
  pluginVue.configs['flat/essential'],

  // recommended TypeScript rules
  vueTsConfigs.recommended,

  // Stylistic formatting rule configs matching current styling preferences
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: true,
    arrowParens: true,
    braceStyle: '1tbs',
  }),

  // Project overrides
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
    },
  }
);

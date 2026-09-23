// Eslint ning tavsiya etilgan qoidalari
import eslint from '@eslint/js';
// Prettier bilan birga ishlash uchun plagin
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// Node va jest uchun global o'zgaruvchilar
import globals from 'globals';
// Typescript uchun eslint sozlamalari
import tseslint from 'typescript-eslint';

// Eslint sozlamalari
export default tseslint.config(
  {
    // Bu faylning o'zini tekshirmaymiz
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Tokendan kelgan ma'lumot any turida bo'lgani uchun bu qoidalarni o'chiramiz
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      // Prisma va o'z enumlarimiz bir xil qiymatga ega bo'lgani uchun
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      // Javob funksiyalari async bo'lgani bilan ichida await bo'lmasligi mumkin
      '@typescript-eslint/require-await': 'off',
      // Xatoni ushlaganda o'zgaruvchidan foydalanmasligimiz mumkin
      '@typescript-eslint/no-unused-vars': [
        'error',
        { caughtErrors: 'none', argsIgnorePattern: '^_' },
      ],
      // Fayl bilan ishlashda xato obyekti any turida keladi
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);

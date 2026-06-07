import path from 'path';
import { defineConfig } from 'vitest/config';

const alias = {
  '@': path.resolve(__dirname, './'),
};

export default defineConfig({
  resolve: { alias },
  test: {
    // `passWithNoTests` is a root-level option in Vitest 4 (not a valid
    // per-project `ProjectConfig` property), so it lives here once and applies
    // to the whole run.
    passWithNoTests: false,
    // Two projects so the existing pure-logic lib tests keep running on the
    // lightweight `node` environment while the new React component tests run in
    // `jsdom`. Splitting by project (rather than a single global environment)
    // keeps the fast node suite fast and avoids loading jsdom for pure logic.
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'lib',
          environment: 'node',
          include: ['lib/**/*.test.ts'],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'components',
          environment: 'jsdom',
          include: ['components/**/*.test.tsx', 'app/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});

import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Mount variables from .env into process.env
dotenv.config();

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts']
  }
});
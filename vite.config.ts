import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load environment variables from .env files in the project root
    const env = loadEnv(mode, process.cwd(), '');

    return {
      define: {
        // Make the environment variables accessible in the client-side code
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
        'process.env.AI_MODEL': JSON.stringify(env.AI_MODEL),
      },
      resolve: {
        alias: {
          // Set up a path alias '@' to point to the project's root directory.
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://lexiassist:lexiassist_secret@localhost:5432/lexiassist?sslmode=disable',
  },
});

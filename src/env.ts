/**
 * Environment Variable Validation
 * 
 * This module validates and exports environment variables with type safety.
 * Uses Zod for runtime validation to ensure all required variables are present.
 */

import { z } from 'zod';

// Define the environment schema
const envSchema = z.object({
  // Public variables (exposed to client)
  NEXT_PUBLIC_API_GATEWAY_URL: z.string().url({
    message: 'NEXT_PUBLIC_API_GATEWAY_URL must be a valid URL',
  }),
  NEXT_PUBLIC_AI_PROXY_URL: z.string().url({
    message: 'NEXT_PUBLIC_AI_PROXY_URL must be a valid URL',
  }),
  NEXT_PUBLIC_WS_URL: z.string().min(1, {
    message: 'NEXT_PUBLIC_WS_URL is required',
  }),
  NEXT_PUBLIC_USE_MOCK_API: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_MOCK_MODE: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_INGESTION_URL: z.string().url(),

  // Server-side only variables
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
      NEXT_PUBLIC_AI_PROXY_URL: process.env.NEXT_PUBLIC_AI_PROXY_URL,
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
      NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
      NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE,
      NEXT_PUBLIC_INGESTION_URL: process.env.NEXT_PUBLIC_INGESTION_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err) => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
      
      console.error('❌ Environment variable validation failed:\n' + missingVars);
      
      throw new Error(
        'Invalid environment variables. Please check your .env.local file.\n' + missingVars
      );
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Helper to check if mock mode is enabled
export const isMockMode = () => {
  return env.NEXT_PUBLIC_USE_MOCK_API === 'true' || env.NEXT_PUBLIC_MOCK_MODE === 'true';
};

// Log configuration on startup (server-side only)
if (typeof window === 'undefined') {
  console.log('🔧 Environment Configuration:');
  console.log(`  - Mode: ${env.NODE_ENV}`);
  console.log(`  - Mock API: ${isMockMode() ? 'Enabled' : 'Disabled'}`);
  console.log(`  - API Gateway: ${env.NEXT_PUBLIC_API_GATEWAY_URL}`);
  console.log(`  - WebSocket: ${env.NEXT_PUBLIC_WS_URL}`);
}

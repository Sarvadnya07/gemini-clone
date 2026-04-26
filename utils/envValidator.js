const { z } = require("zod");
const logger = require("./logger");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().transform(Number).default("5000"),
  MONGODB_URI: z.string().url(),
  GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY is required"),
  FRONTEND_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join(".")).join(", ");
      logger.error(`❌ Environment variable validation failed. Missing or invalid keys: ${missingVars}`);
      process.exit(1);
    }
    throw error;
  }
}

module.exports = validateEnv;

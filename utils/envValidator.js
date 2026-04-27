const { z } = require("zod");
const logger = require("./logger");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().transform(Number).default("5000"),
  MONGODB_URI: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required").optional(),
  FRONTEND_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
      logger.warn(`⚠️ Environment variable validation warning: ${missingVars}`);
      // Don't crash in dev — allow server to start with missing optional vars
      if (process.env.NODE_ENV === "production") {
        logger.error("❌ Cannot start in production with invalid environment.");
        process.exit(1);
      }
    } else {
      throw error;
    }
  }
}

module.exports = validateEnv;

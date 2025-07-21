import { z } from "zod";
import { Logger } from "@/utils/logger";

const logger = new Logger("Config:Env");

// Schema for environment variables
const envSchema = z.object({
  VAPI_PRIVATE_KEY: z.string(),
  VAPI_PUBLIC_KEY: z.string(),
  VAPI_ASSISTANT_ID: z.string(),
  OPENAI_API_KEY: z.string(),
  GOOGLE_API_KEY: z.string(),
  FIRECRAWL_API_KEY: z.string(),
  PINECONE_API_KEY: z.string(),
});

// Function to validate environment variables
const validateEnv = () => {
  try {
    logger.info("Validating environment variables");
    const env = {
      VAPI_PRIVATE_KEY: process.env.VAPI_PRIVATE_KEY,
      VAPI_PUBLIC_KEY: process.env.VAPI_PUBLIC_KEY,
      VAPI_ASSISTANT_ID: process.env.VAPI_ASSISTANT_ID,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
      PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    };
    const parsed = envSchema.parse(env);
    logger.info("Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join("."));
      logger.error("Invalid environment variables", { error: { missingVars } });
      throw new Error(
        `❌ Invalid environment variables: ${missingVars.join(
          ", "
        )}. Please check your .env file`
      );
    }
    throw error;
  }
};

export const env = validateEnv();

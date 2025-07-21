import dotenv from "dotenv";
import FirecrawlApp, { ScrapeResponse } from "@mendable/firecrawl-js";
import { Logger } from "@/utils/logger";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const logger = new Logger("InsertDataToPinecone");

async function main() {
  const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY!,
  });

  const scrapeURL = "https://www.aven.com/support";
  const scrapeResult = await app.scrapeUrl(scrapeURL, {
    formats: ["markdown"],
    onlyMainContent: true,
  });

  logger.info("Scrape result:", scrapeResult);

  if (!scrapeResult.success || !scrapeResult.markdown) {
    throw new Error("Failed to scrape content or no markdown found");
  }

  const model = ai.getGenerativeModel({ model: "gemini-embedding-001" });

  const result = await model.embedContent(scrapeResult.markdown);

  const embedding = result.embedding;

  const namespace = pc.index("customer-support").namespace("aven");

  const pineoneResponse = await namespace.upsert([
    {
      id: `${scrapeResult} - ${Date.now()}`,
      values: embedding.values,
      metadata: {
        chunk_text: scrapeResult.markdown,
        category: "website",
        url: scrapeURL,
      },
    },
  ]);

  logger.info("Response:", embedding);
}

main();

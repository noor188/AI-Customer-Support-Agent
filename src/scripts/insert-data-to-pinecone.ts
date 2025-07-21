import fireCrawlApp from"@mendable/firecrawl-js";
import dotenv from "dotenv";
import { Logger } from "@/utils/logger";

dotenv.config();
const logger = new Logger("InsertDataToPinecone");

async function main(){
    const app = new fireCrawlApp({
        apiKey: process.env.FIRECRAWLER_API_KEY,
    });

    const scrapeResult = await app.scrapeUrl(
        'https://www.aven.com/',{
            formats: ["markdown"],
            onlyMainContent: true
        });
    
    logger.info("Scraping completed successfully", scrapeResult);
}

main();
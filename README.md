# AI Customer Support Agent

An intelligent, voice-enabled customer support agent designed to answer questions about [Aven](https://www.aven.com/), a modern fintech startup.

## ✨ Features

- **Web Scraping**  
  Utilizes the [FireCrawl](https://www.firecrawl.dev/) API to extract real-time content about Aven from the web.

- **Vector Database with Pinecone**  
  Stores vector embeddings using the [Pinecone](https://www.pinecone.io/) API for efficient similarity search.

- **Voice Integration with Vapi**  
  Incorporates [Vapi](https://vapi.ai/) to enable natural voice conversations via a backend voice AI agent.

- **RAG (Retrieval-Augmented Generation)**  
  Enhances response accuracy by retrieving relevant context from Pinecone before generating answers.  
  Based on [Retrieval-Augmented Generation](https://aws.amazon.com/what-is/retrieval-augmented-generation/) principles.

- **LLM via Gemini API**  
  Uses [Google Gemini](https://gemini.google.com/app) for generating intelligent, context-aware responses.

## 🛠️ Tech Stack

- React  
- Next.js  
- JavaScript  
- Pinecone  
- REST APIs  
- LLM (Large Language Models)

## 🔐 Environment Variables

Create a `.env` file in the `AI-CUSTOMER-AGENT` directory with the following values:

```env
VAPI_PRIVATE_KEY=your_vapi_private_api_key_here
VAPI_PUBLIC_KEY=your_vapi_public_api_key_here
VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
```
## 📦 Installation

Follow these steps to install and run the project locally:

1. Clone the repository:
   
```
git clone https://github.com/your-username/ai-customer-support-agent.git
cd ai-customer-support-agent
```

2. Install dependencies:
```
npm install
# or
yarn install
```

3. Add environment variables:

Create a .env file in the root directory and copy the environment variable keys from above.

4. Run the development server:

```
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Visit your app:

Open your browser and go to http://localhost:3000

## 🧠 Future Improvements
- Preprocess and clean scraped content

- Chunk content into smaller segments before embedding into Pinecone




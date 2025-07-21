import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import OpenAI from "openai";
import { env } from "@/config/env";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { context } from "@pinecone-database/pinecone/dist/assistant/data/context";
import { log } from "console";

const logger = new Logger("API:Chat");

const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

const namespace = pinecone.index("customer-support").namespace("aven");
const ai = new GoogleGenerativeAI(env.GOOGLE_API_KEY!);
const embeddingModel = ai.getGenerativeModel({ model: "gemini-embedding-001" });

const gemini = new OpenAI({
  apiKey: env.GOOGLE_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    // logger.info("Received request body:", {
    //   hasMessages: !!body.messages,
    //   stream: body.stream,
    // });

    const {
      model,
      messages,
      max_tokens,
      temperature,
      stream,
      call,
      ...restParams
    } = body;

    // Validate required parameters
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      return NextResponse.json(
        { error: "Last message must have content" },
        { status: 400 }
      );
    }

    logger.info("Creating prompt modification...");

    const query = lastMessage.content;
    logger.info("Query for embedding:", query);

    const embedding = await embeddingModel.embedContent(query);
    logger.info("Embedding:", embedding);

    const response = await namespace.query({
      vector: embedding.embedding.values,
      topK: 15,
      includeMetadata: true,
      includeValues: false,
    });

    logger.info("Pinecone query response:", response);

    const context = response.matches
      ?.map(match => match.metadata?.chunk_text)
      .join("\n\n");

    const geminiPrompt = `
    Answer my question based on the following context:
    ${context}
    
    Question: ${query}
    Answer:`;
    // Create modified prompt
    const prompt = await gemini.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [
        {
          role: "user",
          content: geminiPrompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const modifiedContent = prompt.choices[0]?.message?.content;
    if (!modifiedContent) {
      return NextResponse.json(
        { error: "Failed to generate modified prompt" },
        { status: 500 }
      );
    }

    const modifiedMessages = [
      ...messages.slice(0, messages.length - 1),
      { ...lastMessage, content: modifiedContent },
    ];

    logger.info("Creating completion...", {
      stream,
      messagesCount: modifiedMessages.length,
    });

    if (stream) {
      // Handle streaming response
      const completionStream = await gemini.chat.completions.create({
        model: "gemini-2.0-flash-lite",
        messages: modifiedMessages,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: true,
      });

      // Create a readable stream for the response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completionStream) {
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (error) {
            logger.error("Streaming error", error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Handle non-streaming response
      const completion = await gemini.chat.completions.create({
        model: "gemini-2.0-flash-lite",
        messages: modifiedMessages,
        max_tokens: max_tokens || 150,
        temperature: temperature || 0.7,
        stream: false,
      });

      logger.info("Completion created successfully");
      return NextResponse.json(completion);
    }
  } catch (error) {
    logger.error("API Error:", error);

    // Handle specific OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: `API Error: ${error.message}`,
          code: error.code,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

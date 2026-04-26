import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels in the simple SDK, usually requires a different client
    // But we can try a few standard ones
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
    
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("test");
            console.log(`✓ Model ${m} is AVAILABLE`);
        } catch (e: any) {
            console.log(`❌ Model ${m} FAILED: ${e.message}`);
        }
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey!);
  
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-1.5-flash-002"];
  
  for (const m of models) {
    try {
      console.log(`Checking ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`✅ ${m} WORKS! Result: ${result.response.text().substring(0, 20)}...`);
      return; // Found a working one
    } catch (e: any) {
      console.log(`❌ ${m} Failed: ${e.message}`);
    }
  }
}

test();

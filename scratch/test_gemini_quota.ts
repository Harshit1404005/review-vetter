import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testQuota() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try 1.5 Flash instead of 2.0 to see if it makes a difference
  console.log("Testing Gemini 1.5 Flash Quota...");
  const model15 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    const result = await model15.generateContent("Hello, are you online?");
    console.log("✓ Gemini 1.5 Flash Response:", result.response.text());
  } catch (err: any) {
    console.error("❌ Gemini 1.5 Failed:", err.message);
  }

  // Try 2.0 Flash again
  console.log("\nTesting Gemini 2.0 Flash Quota...");
  const model20 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  try {
    const result = await model20.generateContent("Hello, are you online?");
    console.log("✓ Gemini 2.0 Flash Response:", result.response.text());
  } catch (err: any) {
    console.error("❌ Gemini 2.0 Failed:", err.message);
  }
}

testQuota();

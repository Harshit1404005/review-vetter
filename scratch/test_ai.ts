import { IntelligenceService } from '../src/lib/services/intelligence';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log("Starting Intelligence Test...");
  const reviews = [
    { id: '1', rating: 5, title: 'Amazing', body: 'Best product ever!', author: 'User1', date: '2024-01-01', source: 'AMAZON' as const },
    { id: '2', rating: 1, title: 'Terrible', body: 'Broke on day one.', author: 'User2', date: '2024-01-02', source: 'AMAZON' as const }
  ];
  
  try {
    const result = await IntelligenceService.analyzeReviews("Test Product", reviews);
    console.log("✓ AI Analysis Successful!");
    console.log("Score:", result.score);
    console.log("SWOT Strengths:", result.swot.strengths);
  } catch (err) {
    console.error("❌ Test Failed:", err);
  }
}

test();

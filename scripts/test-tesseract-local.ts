import { createWorker } from "tesseract.js";
import path from "path";

async function testLocalTesseract() {
  console.log("Testing Tesseract with local traineddata path...");
  const start = Date.now();
  try {
    const langPath = process.cwd();
    console.log("Using langPath:", langPath);
    
    // Create worker with local langPath
    const worker = await createWorker("eng", 1, {
      langPath: langPath,
      cachePath: langPath,
    });
    console.log(`Worker created in ${Date.now() - start}ms`);
    
    // Test with a sample text recognition or minimal buffer
    await worker.terminate();
    console.log("Worker terminated successfully!");
  } catch (err: any) {
    console.error("Local worker test failed:", err);
  }
}

testLocalTesseract();

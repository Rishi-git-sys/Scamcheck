import { createWorker } from "tesseract.js";

async function testOcr() {
  console.log("Creating Tesseract worker in Node.js...");
  const start = Date.now();
  try {
    const worker = await createWorker("eng");
    console.log(`Worker created in ${Date.now() - start}ms`);
    await worker.terminate();
    console.log("Worker terminated cleanly!");
  } catch (err: any) {
    console.error("Worker error:", err);
  }
}

testOcr();

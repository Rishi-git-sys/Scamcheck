import path from "path";
import fs from "fs";

function checkPaths() {
  const cwd = process.cwd();
  const workerPath = path.resolve(cwd, "node_modules/tesseract.js/src/worker-script/node/index.js");
  const corePath = path.resolve(cwd, "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js");
  const fallbackCorePath = path.resolve(cwd, "node_modules/tesseract.js-core/tesseract-core.wasm.js");
  const langPath = path.resolve(cwd, "eng.traineddata");

  console.log("workerPath exists:", fs.existsSync(workerPath), workerPath);
  console.log("corePath exists:", fs.existsSync(corePath), corePath);
  console.log("fallbackCorePath exists:", fs.existsSync(fallbackCorePath), fallbackCorePath);
  console.log("langPath exists:", fs.existsSync(langPath), langPath);
}

checkPaths();

import { summarizeUsage } from '../src/usage/logger.js';

function main() {
  const summary = summarizeUsage();
  console.log(JSON.stringify(summary, null, 2));
}

main();

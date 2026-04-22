const [url, timeoutSeconds = '60'] = process.argv.slice(2);

if (!url) {
  console.error('Usage: node scripts/ci/wait-for-url.mjs <url> [timeoutSeconds]');
  process.exit(1);
}

const timeoutMs = Number(timeoutSeconds) * 1000;
const startedAt = Date.now();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`Ready: ${url}`);
        return;
      }
      console.log(`Waiting for ${url} - HTTP ${response.status}`);
    } catch (error) {
      console.log(`Waiting for ${url} - ${error.message}`);
    }
    await sleep(2000);
  }

  console.error(`Timeout waiting for ${url}`);
  process.exit(1);
}

main();

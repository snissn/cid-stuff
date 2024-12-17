
import { commp, generateCommPCid } from './dist/bundle.js';

self.addEventListener('message', async (e) => {
  const { file } = e.data;

  try {
    // Perform the CommP calculation
    const result = await commp(file);
    const commpCid = generateCommPCid(result.commp);

    // Send the result back to the main thread
    postMessage({ result: { ...result, commpCid } });
  } catch (error) {
    // Send any errors back to the main thread
    postMessage({ error: error.message });
  }
});


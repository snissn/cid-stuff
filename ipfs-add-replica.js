import fs from 'fs';
import { importer } from 'ipfs-unixfs-importer';
import { CID } from 'multiformats/cid';
import * as dagPB from '@ipld/dag-pb';
import { base32 } from 'multiformats/bases/base32';

// Ensure a filename is provided
const fileName = process.argv[2];

if (!fileName) {
  console.error('Usage: node ipfs-add-replica.js <filename>');
  process.exit(1);
}

// Create a readable stream from the file
const fileStream = fs.createReadStream(fileName);

// In-memory blockstore to store chunks temporarily
const blockstore = {
  store: new Map(),
  async put(cid, bytes) {
    this.store.set(cid.toString(), bytes);
  },
  async get(cid) {
    return this.store.get(cid.toString());
  }
};

// Function to replicate IPFS add process
async function replicateIpfsAdd(stream) {
  try {
    const options = {
      maxChunkSize: 262144, // 256 KB chunk size
      rawLeaves: true      // Use DAG-PB encoding (not raw leaves)
    };

    const source = [{ content: stream }];

    for await (const file of importer(source, blockstore, options)) {
      console.log('Generated CID:', file.cid.toString(base32));
    }
  } catch (error) {
    console.error('Error replicating IPFS add:', error.message);
  }
}

// Execute the function
(async () => {
  console.log(`Replicating IPFS add process for file: ${fileName}`);
  await replicateIpfsAdd(fileStream);
})();



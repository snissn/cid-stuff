import fs from 'fs';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from '@noble/hashes/sha256';
import { create } from 'multiformats/hashes/digest';

// Ensure a filename is provided
const fileName = process.argv[2];

if (!fileName) {
  console.error('Usage: node generate-cid.js <filename>');
  process.exit(1);
}

// Read the file
let data;
try {
  data = fs.readFileSync(fileName);
} catch (error) {
  console.error('Error reading file:', error.message);
  process.exit(1);
}

// Create a multihash using SHA-256
const hash = sha256(data);
const multihash = create(0x12, hash);

// Generate CIDv1
const cid = CID.create(1, raw.code, multihash);
console.log('CIDv1 (SHA-256):', cid.toString());


const fs = require("fs").promises;
const path = require("path");
const zlib = require("zlib");

// Simple SHA-1-like hash (for demo, not real SHA-1)
function fakeHash(content) {
  let total = 0;
  for (let char of content) total += char.charCodeAt(0);
  return total.toString(16).padStart(40, "0"); // Fake 40-char hash
}

// Store a commit
async function storeCommit(commitData) {
  const content = JSON.stringify(commitData);
  const hash = fakeHash(content); // e.g., "000...1234"
  const dir = hash.slice(0, 4);   // First 4 chars
  const file = hash.slice(4);     // Rest
  const dirPath = path.join("objects", dir);
  
  // Create directory if it doesn’t exist
  await fs.mkdir(dirPath, { recursive: true });
  
  // Compress and write
  const compressed = zlib.deflateSync(content);
  await fs.writeFile(path.join(dirPath, file), compressed);
  return hash;
}

// Retrieve a commit
async function getCommit(hash) {
  const dir = hash.slice(0, 4);
  const file = hash.slice(4);
  const filePath = path.join("objects", dir, file);
  
  try {
    const compressed = await fs.readFile(filePath);
    const content = zlib.inflateSync(compressed).toString();
    return JSON.parse(content);
  } catch (err) {
    return "Commit not found";
  }
}

// Usage
(async () => {
  const commit = { message: "Add feature", author: "Bob" };
  const hash = await storeCommit(commit);
  console.log("Commit Hash:", hash);
  
  const retrieved = await getCommit(hash);
  console.log("Retrieved Commit:", retrieved);
})();

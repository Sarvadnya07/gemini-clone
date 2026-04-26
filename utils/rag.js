const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Split text into overlapping chunks
 */
function chunkText(text, size = 1000, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += (size - overlap);
  }
  return chunks;
}

/**
 * Get embeddings for a text or array of texts
 */
async function getEmbeddings(content) {
  if (!genAI) return null;
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  if (Array.isArray(content)) {
    const results = await model.batchEmbedContents({
      requests: content.map(text => ({ content: { role: "user", parts: [{ text }] } }))
    });
    return results.embeddings.map(e => e.values);
  } else {
    const result = await model.embedContent(content);
    return result.embedding.values;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  return (mA === 0 || mB === 0) ? 0 : dotProduct / (mA * mB);
}

/**
 * Perform RAG: find top chunks for a query
 */
async function performRAG(query, documents, topK = 3) {
  if (!documents || documents.length === 0) return "";

  const queryEmbedding = await getEmbeddings(query);
  if (!queryEmbedding) return "";

  const results = documents.map(doc => ({
    text: doc.text,
    similarity: cosineSimilarity(queryEmbedding, doc.embedding)
  }));

  // Sort and take top K
  const topChunks = results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(r => r.text);

  return topChunks.join("\n\n---\n\n");
}

module.exports = { chunkText, getEmbeddings, performRAG };

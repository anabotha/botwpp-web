export async function generateEmbedding(text: string): Promise<number[]> {
     // Mock embedding generation
     return new Array(1536).fill(0).map(() => Math.random());
}

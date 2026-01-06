import * as embeddingsService from "../services/embeddings.service";

export const getAllEmbeddings = async (req, res) => {
     try {
          const data = await embeddingsService.getContextEmbeddings();
          // En Express usamos res.status().json()
          return res.status(200).json(data);
     } catch (error) {
          return res.status(500).json({ error: error.message });
     }
};
import fs from "fs";
import path from "path";
// Función para cargar documentos con sus embeddings pre-calculados
export function loadEmbeddedDocuments() {
  const docsDir = path.join(process.cwd(), "docs");
  const documents: any[] = [];

  // Cargar todos los archivos JSON de documentos embebidos
  const files = ["roles.json","f1embedded.json", "f2embedded.json", "f3embedded.json", "f4embedded.json","f1embedded1st (1).json","f1embedded1st (2).json","f1embedded1st (3).json","f1embedded1st (4).json"];

  for (const file of files) {
    try {
      const filePath = path.join(docsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);

      
      if (data.extractedData && data.embedding) {
  // Si existen párrafos (formato viejo)
  if (data.extractedData.paragraphs) {
    data.extractedData.paragraphs.forEach((paragraph: any) => {
      documents.push({
        content: paragraph.content||paragraph.text, // Asegurarse de que exista 'content' o 'text'
        documentEmbedding: data.embedding,
        sourceFile: file
      });
    });
  }

  // Si existen secciones (formato nuevo)
  if (data.extractedData.sections) {
    data.extractedData.sections.forEach((section: any) => {
      // Si la sección tiene solo texto
      if (typeof section.content === "string") {
        documents.push({
          content: section.content,
          documentEmbedding: data.embedding,
          sourceFile: file
        });
      }
      // Si la sección tiene roles
      if (Array.isArray(section.content)) {
        section.content.forEach((roleData: any) => {
          const roleText = `${roleData.role}: ${roleData.responsibilities.join("; ")}`;
          documents.push({
            content: roleText,
            documentEmbedding: data.embedding,
            sourceFile: file
          });
        });
      }
    });
  }
}

    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return documents;
}
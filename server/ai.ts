
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeFile(files: Array<{name: string, type: string, url: string}>) {
  const fileContents = await Promise.all(
    files.map(async file => {
      const filePath = `.${file.url}`;
      const content = await fs.readFile(filePath);
      
      if (file.type === 'pdf') {
        const pdfData = await pdf(content);
        return pdfData.text;
      }
      
      return content.toString();
    })
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Eres un asistente financiero experto. Analiza los documentos proporcionados y genera un resumen detallado incluyendo: categorización de gastos, patrones de gasto, recomendaciones de ahorro y cualquier aspecto relevante para la salud financiera."
      },
      {
        role: "user",
        content: `Analiza los siguientes documentos:\n\n${fileContents.join('\n\n')}`
      }
    ]
  });

  return response.choices[0].message.content;
}

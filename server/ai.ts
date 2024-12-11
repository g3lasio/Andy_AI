
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Verificar conexión con OpenAI
async function checkOpenAIConnection() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('API Key de OpenAI no configurada');
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: "Test connection" }],
      max_tokens: 5
    });
    
    if (!response.model.includes('gpt-4')) {
      throw new Error('No se está usando GPT-4. Modelo actual: ' + response.model);
    }
    
    console.log('✅ Conexión con OpenAI (GPT-4) establecida correctamente');
    console.log('🤖 Modelo en uso:', response.model);
    return true;
  } catch (error) {
    console.error('Error de conexión con OpenAI:', error);
    throw new Error('No se pudo establecer conexión con OpenAI');
  }
}

// Verificar conexión al iniciar
checkOpenAIConnection().catch(error => {
  console.error('Error crítico:', error.message);
  process.exit(1);
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

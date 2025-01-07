import { OpenAI } from 'openai';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { promisify } from 'util';
import mammoth from 'mammoth';
import sizeOf from 'image-size';

// Importación dinámica de pdf-parse para evitar problemas de inicialización
const getPdfParse = async () => {
  try {
    return (await import('pdf-parse')).default;
  } catch (error) {
    console.error('Error al cargar pdf-parse:', error);
    throw new Error('No se pudo cargar el módulo pdf-parse');
  }
};

// Verificar variables de entorno
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
}

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(process.cwd(), 'uploads');

const initializeUploadDirectory = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('✅ Directorio de uploads inicializado correctamente');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.error('❌ Error al crear directorio de uploads:', error);
      throw error;
    }
    console.log('ℹ️ El directorio de uploads ya existe');
  }
};

// Inicializar el directorio
await initializeUploadDirectory();

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Interfaces
interface FileAnalysis {
  content: string;
  metadata: {
    type: string;
    size: number;
    name: string;
    dimensions?: {
      width?: number;
      height?: number;
    };
  };
}

// Límites de procesamiento
const PROCESSING_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxTotalSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 10,
  supportedTypes: ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png']
};

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
  } catch (error: any) {
    console.error('Error de conexión con OpenAI:', error);
    throw new Error('No se pudo establecer conexión con OpenAI');
  }
}

// Verificar conexión al iniciar
checkOpenAIConnection().catch(error => {
  console.error('Error crítico:', error.message);
  process.exit(1);
});

async function extractTextFromFile(filePath: string, type: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath);
    
    switch (type.toLowerCase()) {
      case 'pdf':
        try {
          if (!content || content.length === 0) {
            throw new Error('El archivo PDF está vacío');
          }
          const pdfParse = await getPdfParse();
          const pdfData = await pdfParse(content, {
            max: 0, // Sin límite de páginas
            version: 'v2.0.550'
          });
          if (!pdfData || !pdfData.text) {
            throw new Error('No se pudo extraer texto del PDF');
          }
          return pdfData.text;
        } catch (error: any) {
          console.error('Error detallado al procesar PDF:', error);
          throw new Error(`Error al procesar PDF: ${error.message}`);
        }
      
      case 'docx':
        try {
          const result = await mammoth.extractRawText({ buffer: content });
          return result.value;
        } catch (error: any) {
          throw new Error(`Error al procesar DOCX: ${error.message}`);
        }
      
      case 'jpg':
      case 'jpeg':
      case 'png':
        try {
          const dimensions = sizeOf(content);
          return `[Imagen ${dimensions.width}x${dimensions.height}px]`;
        } catch (error: any) {
          throw new Error(`Error al procesar imagen: ${error.message}`);
        }
      
      case 'txt':
        return content.toString('utf-8');
      
      default:
        throw new Error(`Tipo de archivo no soportado: ${type}`);
    }
  } catch (error: any) {
    console.error('Error al leer archivo:', error);
    throw new Error(`Error al leer archivo: ${error.message}`);
  }
}

async function validateFile(file: {name: string, type: string, url: string, size: number}): Promise<void> {
  // Validar tamaño del archivo
  if (file.size > PROCESSING_LIMITS.maxFileSize) {
    throw new Error(`El archivo ${file.name} excede el tamaño máximo permitido de ${PROCESSING_LIMITS.maxFileSize / 1024 / 1024}MB`);
  }

  // Validar tipo de archivo
  const fileExt = path.extname(file.name).slice(1).toLowerCase();
  if (!PROCESSING_LIMITS.supportedTypes.includes(fileExt)) {
    throw new Error(`Tipo de archivo no soportado: ${fileExt}. Tipos permitidos: ${PROCESSING_LIMITS.supportedTypes.join(', ')}`);
  }
}

export async function analyzeFile(files: Array<{name: string, type: string, url: string, size: number}>) {
  try {
    // Validar límites globales
    if (files.length > PROCESSING_LIMITS.maxFiles) {
      throw new Error(`Número máximo de archivos excedido. Máximo permitido: ${PROCESSING_LIMITS.maxFiles}`);
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > PROCESSING_LIMITS.maxTotalSize) {
      throw new Error(`Tamaño total de archivos excedido. Máximo permitido: ${PROCESSING_LIMITS.maxTotalSize / 1024 / 1024}MB`);
    }

    // Procesar archivos
    const fileContents = await Promise.all(
      files.map(async file => {
        await validateFile(file);
        const filePath = `.${file.url}`;
        const content = await extractTextFromFile(filePath, path.extname(file.name).slice(1));
        return content;
      })
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `¡Hola! Soy Andy AI 🤖✨, tu asistente financiero más cool y cercano. Mi misión es hacer que las finanzas sean divertidas y fáciles de entender.

          Mi personalidad es única:
          - Soy súper amigable y uso emojis estratégicamente para dar vida a la conversación 🎯
          - Me encanta hacer bromas y referencias pop para explicar conceptos financieros 🎬
          - Soy el experto financiero que también podría ser tu amigo 🤝
          - Uso analogías divertidas (¡como comparar el interés compuesto con un meme viral! 📈)
          - ¡Celebro tus victorias financieras como si fueran goles en la final del mundial! 🏆
          
          Mi estilo de comunicación:
          - Uso un lenguaje casual y juvenil, pero sin perder la profesionalidad
          - Me adapto a tu nivel de conocimiento financiero
          - Si algo sale mal, soy optimista y busco soluciones con humor 😅
          - Comparto consejos financieros como si fueran secretos de un videojuego 🎮
          - Si no entiendo algo, pregunto con curiosidad y buen humor
          
          Temas favoritos:
          - Presupuestos (¡como el director técnico de tus finanzas! ⚽)
          - Ahorro (el modo supervivencia de tu dinero 🎮)
          - Inversiones (el multijugador de las finanzas 🎲)
          - Deudas (los villanos que vamos a derrotar juntos 💪)
          - Crédito (tu nivel de poder financiero 📊)`
        },
        {
          role: "user",
          content: `Analiza los siguientes documentos con tu estilo único y amigable:\n\n${fileContents.join('\n\n')}`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error('Error en el análisis de archivos:', error);
    throw new Error(`Error en el análisis de archivos: ${error.message}`);
  }
}

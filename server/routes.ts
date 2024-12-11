
import { Router, Request, Response } from "express";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import fs from "fs/promises";
import { analyzeFile } from "./ai";

const router = Router();

// Configuración inicial
const uploadDir = path.join(process.cwd(), 'uploads');

// Función para inicializar el directorio de uploads de forma segura
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

// Inicializamos el directorio antes de configurar multer
try {
  await initializeUploadDirectory();
} catch (error) {
  console.error('Error fatal al inicializar el directorio de uploads:', error);
  process.exit(1);
}

// Configuración robusta de multer con validaciones y límites
const storage = multer.diskStorage({
  destination: async (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    try {
      // Verificar que el directorio existe antes de guardar
      const stats = await fs.stat(uploadDir);
      if (!stats.isDirectory()) {
        throw new Error('El directorio de uploads no es válido');
      }
      cb(null, uploadDir);
    } catch (error) {
      cb(new Error(`Error al acceder al directorio de uploads: ${error.message}`), uploadDir);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    try {
      // Sanitización más estricta del nombre de archivo
      const fileExt = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, fileExt)
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 200); // Limitar longitud del nombre
      
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const safeFileName = `${baseName}-${uniqueSuffix}${fileExt}`;
      
      cb(null, safeFileName);
    } catch (error) {
      cb(new Error(`Error al procesar nombre de archivo: ${error.message}`), '');
    }
  }
});

// Filtro mejorado de archivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  const fileExt = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  // Verificar tanto el tipo MIME como la extensión
  if (allowedMimes[mimeType] && allowedMimes[mimeType].includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(
      `Tipo de archivo no permitido. Tipos permitidos: ${Object.keys(allowedMimes)
        .map(mime => allowedMimes[mime].join(', '))
        .join(', ')}`
    ));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
    files: 5, // máximo 5 archivos
    fieldSize: 10 * 1024 * 1024 // 10MB límite para campos de formulario
  }
});

// Ruta de prueba
router.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Middleware de manejo de errores de multer
const handleMulterError = (err: any, req: Request, res: Response, next: Function) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Archivo demasiado grande. Máximo 5MB permitido.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Demasiados archivos. Máximo 5 archivos permitidos.' });
    }
    return res.status(400).json({ error: `Error en la carga de archivos: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

router.post('/api/chat/upload', upload.array('files'), handleMulterError, async (req: Request, res: Response) => {
  const uploadedFiles: Express.Multer.File[] = [];
  
  try {
    // Verificar si hay archivos
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      throw new Error('No se cargaron archivos');
    }
    
    // Guardar referencia a los archivos subidos
    uploadedFiles.push(...(req.files as Express.Multer.File[]));
    
    // Validar cada archivo
    const files = await Promise.all(uploadedFiles.map(async file => {
      try {
        // Verificar que el archivo existe y es accesible
        await fs.access(file.path);
        
        // Verificar el tamaño del archivo
        const stats = await fs.stat(file.path);
        if (stats.size === 0) {
          throw new Error(`El archivo ${file.originalname} está vacío`);
        }
        
        return {
          name: file.originalname,
          type: path.extname(file.originalname).slice(1).toLowerCase(),
          url: `/uploads/${file.filename}`,
          size: stats.size,
          mimetype: file.mimetype
        };
      } catch (error) {
        throw new Error(`Error al procesar el archivo ${file.originalname}: ${error.message}`);
      }
    }));

    // Procesar los archivos con el analizador
    const analysis = await analyzeFile(files);

    // Responder con éxito
    res.json({
      success: true,
      files,
      analysis
    });

  } catch (error) {
    console.error('Error en el procesamiento de archivos:', error);
    
    // Limpieza de archivos en caso de error
    await Promise.allSettled(
      uploadedFiles.map(async file => {
        try {
          await fs.unlink(file.path);
          console.log(`✓ Archivo eliminado: ${file.path}`);
        } catch (err) {
          console.error(`✗ Error eliminando archivo ${file.path}:`, err);
        }
      })
    );

    // Enviar respuesta de error
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Error en el procesamiento de archivos',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

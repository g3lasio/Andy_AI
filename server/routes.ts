
import { Router, Request, Response } from "express";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import { analyzeFile } from "./ai";

const router = Router();

import { promisify } from 'util';
import { mkdir } from 'fs/promises';

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(process.cwd(), 'uploads');

const initializeUploadDirectory = async () => {
  try {
    await mkdir(uploadDir, { recursive: true });
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

// Configuración de multer con validaciones y límites
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Sanitizar nombre de archivo
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Lista de tipos MIME permitidos
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedMimes.join(', ')}`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
    files: 5 // máximo 5 archivos
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
  try {
    const uploadedFiles = req.files as Express.Multer.File[];
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No se cargaron archivos' });
    }

    const files = uploadedFiles.map(file => ({
      name: file.originalname,
      type: path.extname(file.originalname).slice(1),
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    const analysis = await analyzeFile(files);

    res.json({
      files,
      analysis
    });
  } catch (error) {
    console.error('Error en el procesamiento de archivos:', error);
    // Limpieza de archivos en caso de error
    if (req.files) {
      const uploadedFiles = req.files as Express.Multer.File[];
      for (const file of uploadedFiles) {
        try {
          await fs.promises.unlink(file.path);
        } catch (err) {
          console.error(`Error eliminando archivo ${file.path}:`, err);
        }
      }
    }
    res.status(500).json({ error: 'Error en el procesamiento de archivos' });
  }
});

export default router;

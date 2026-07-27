const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Função auxiliar para determinar a subpasta com base no MIME type
const getSubfolderByMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'images';
  }
  if (mimetype === 'application/pdf') {
    return 'pdf';
  }
  if (
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'excel';
  }
  return 'others';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Identifica o nome da subpasta (images, pdf, excel, etc.)
    const subfolder = getSubfolderByMimeType(file.mimetype);
    
    // Define o caminho completo da subpasta: backend/uploads/<subpasta>
    const targetFolder = path.resolve(__dirname, '..', '..', 'uploads', subfolder);

    // Cria a subpasta automaticamente se ela ainda não existir
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    cb(null, targetFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/pjpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Envie apenas imagens, PDF ou planilhas Excel.'));
    }
  }
});

module.exports = upload;
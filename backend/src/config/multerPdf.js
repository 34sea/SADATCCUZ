const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadFolder = path.resolve(
    __dirname,
    '..',
    '..',
    'uploads',
    'pdf'
);

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

        const ext = path.extname(file.originalname);

        cb(
            null,
            `tcc-document-${uniqueSuffix}${ext}`
        );
    }
});

const uploadPdf = multer({
    storage,

    limits: {
        fileSize: 20 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (file.mimetype !== 'application/pdf') {
            return cb(
                new Error('Apenas arquivos PDF são permitidos.')
            );
        }

        cb(null, true);
    }
});

module.exports = uploadPdf;
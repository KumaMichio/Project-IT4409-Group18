const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, '../../uploads/videos');
const avatarsDir = path.join(__dirname, '../../uploads/avatars');
const documentsDir = path.join(__dirname, '../../uploads/documents');
const thumbnailsDir = path.join(__dirname, '../../uploads/thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

// Filter chỉ cho phép file video
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file video (mp4, webm, ogg)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  }
});

// Cấu hình storage cho avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase(); // Normalize về chữ thường
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Filter chỉ cho phép file ảnh - cải thiện version
const imageFilter = (req, file, cb) => {
  // Kiểm tra extension (case-insensitive)
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  // Kiểm tra MIME type (case-insensitive)
  const allowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/pjpeg', // Một số browser gửi MIME type này cho JPEG
    'image/x-png'  // Một số browser gửi MIME type này cho PNG
  ];
  
  // Kiểm tra cả extension và MIME type
  const isValidExtension = allowedExtensions.includes(ext);
  const isValidMimeType = allowedMimes.includes(file.mimetype.toLowerCase());
  
  if (isValidExtension && isValidMimeType) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ cho phép upload file ảnh (jpg, jpeg, png, gif, webp). File hiện tại: ${file.originalname}, Extension: ${ext}, MIME: ${file.mimetype}`), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Cấu hình storage cho PDF documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `document-${uniqueSuffix}${ext}`);
  }
});

// Filter chỉ cho phép file PDF
const pdfFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file PDF'), false);
  }
};

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// Cấu hình storage cho thumbnail
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thumbnailsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase(); // Normalize về chữ thường
    cb(null, `thumbnail-${uniqueSuffix}${ext}`);
  }
});

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter, // Dùng chung filter với avatar
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

module.exports = {
  uploadVideo: upload.single('video'),
  uploadAvatar: avatarUpload.single('avatar'),
  uploadPDF: documentUpload.single('document'),
  uploadThumbnail: thumbnailUpload.single('thumbnail')
};


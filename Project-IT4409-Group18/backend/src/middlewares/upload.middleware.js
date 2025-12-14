const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, '../../uploads/videos');
const avatarsDir = path.join(__dirname, '../../uploads/avatars');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
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
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Filter chỉ cho phép file ảnh
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpg, jpeg, png, gif, webp)'), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = {
  uploadVideo: upload.single('video'),
  uploadAvatar: avatarUpload.single('avatar')
};


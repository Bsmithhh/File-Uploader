const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Check if Cloudinary is properly configured
const cloudinaryEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingCloudinaryVars = cloudinaryEnvVars.filter(envVar => !process.env[envVar]);

if (missingCloudinaryVars.length > 0) {
  console.warn('Missing Cloudinary environment variables:', missingCloudinaryVars.join(', '));
  console.warn('File uploads will not work properly without Cloudinary configuration');
}

cloudinary.config(cloudinaryConfig);

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'drive-app', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    public_id: (req, file) => {
      // Generate unique filename
      return Date.now() + '-' + file.originalname.replace(/\.[^/.]+$/, "");
    }
  }
});

module.exports = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
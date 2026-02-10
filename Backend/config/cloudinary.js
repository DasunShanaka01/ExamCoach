const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using CLOUDINARY_URL
cloudinary.config({
    cloud_name: 'du1gjenvg',
    api_key: '735518326372853',
    api_secret: 'APN9C79BAZrybhYYiCL69pqelRs'
});

// Profile pictures (images only)
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'examcoach_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
});

// Course materials (documents, slides, videos)
const materialStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'examcoach_materials',
        resource_type: 'auto',
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mov', 'avi', 'mkv', 'jpg', 'jpeg', 'png']
    }
});

const profileUpload = multer({ storage: profileStorage });
const materialUpload = multer({ storage: materialStorage });

module.exports = profileUpload;
module.exports.materialUpload = materialUpload;

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary using CLOUDINARY_URL
cloudinary.config({
    cloud_name: 'du1gjenvg',
    api_key: '735518326372853',
    api_secret: 'APN9C79BAZrybhYYiCL69pqelRs'
});

// Storage for profile images
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'examcoach_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
});

// Storage for video uploads
const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'examcoach_videos',
        allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
        resource_type: 'video'
    },
});

// Storage for thumbnail images
const thumbnailStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'examcoach_thumbnails',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 320, height: 180, crop: 'fill' }]
    },
});

const uploadImage = multer({ storage: imageStorage });
const uploadVideo = multer({ storage: videoStorage });
const uploadThumbnail = multer({ storage: thumbnailStorage });

module.exports = { uploadImage, uploadVideo, uploadThumbnail, cloudinary };

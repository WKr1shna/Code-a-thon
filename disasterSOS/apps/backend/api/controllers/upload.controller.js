const admin = require('../config/firebase');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const bucket = admin.storage().bucket();
    const fileName = `images/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      next(err);
    });

    blobStream.on('finish', async () => {
      try {
        // Make the file publicly readable
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        
        res.json({
          success: true,
          data: { url: publicUrl }
        });
      } catch (err) {
        next(err);
      }
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'File URL is required' });
    }

    const bucket = admin.storage().bucket();
    
    // Extract relative storage file path from public Google Storage URL
    // Format: https://storage.googleapis.com/bucket-name/images/123456_filename.jpg
    const searchString = `https://storage.googleapis.com/${bucket.name}/`;
    if (!url.startsWith(searchString)) {
      return res.status(400).json({ success: false, message: 'Invalid Firebase Storage URL for this environment bucket' });
    }

    const relativePath = url.substring(searchString.length);
    const file = bucket.file(relativePath);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Target file not found in storage bucket' });
    }

    await file.delete();
    res.json({ success: true, message: 'Image deleted successfully from storage bucket' });
  } catch (error) {
    next(error);
  }
};

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "drifthaus_DEV",
        allowed_formats: ["png", "jpg", "jpeg"],
        resource_type: "image",
      },
      (err, result) => {
        if (err) {
          return cb(err);
        }

        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
        });
      }
    );

    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, cb) {
    if (!file.filename) {
      return cb(null);
    }

    cloudinary.uploader.destroy(file.filename, cb);
  },
};

module.exports = { cloudinary, storage };

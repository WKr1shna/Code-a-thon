// Multer config for incident photo upload
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
module.exports = upload;

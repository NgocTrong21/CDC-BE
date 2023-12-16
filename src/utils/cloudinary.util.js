const cloudinary = require("cloudinary").v2;

const cloudinary_config = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Log the configuration


  if (
    cloudinary_config.api_key != undefined &&
    cloudinary_config.api_secret != undefined &&
    cloudinary_config.cloud_name != undefined
  ) {
    console.log(
      "Cloudinary configuration: OK, cloudinary name: " +
        cloudinary_config.cloud_name
    );
    console.log("============================================================");
  } else {
    console.log("Cloudinary configuration: Failed");
    console.log("============================================================");
  }


module.exports = cloudinary;

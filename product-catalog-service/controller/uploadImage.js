 
const cloudinary = require("../cloudinary/cloudinary");
async function updateImage(req, res) {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }

        const uploadImage = await cloudinary.uploader.upload(image, {
            upload_preset: "unsigned_upload",
            public_id: `avatar_${Date.now()}`,
            allowed_formats: ["png", "jpg", "jpeg", "svg", "jfif", "webp", "ico"],
        });

        // console.log("Upload success:", uploadImage);

        res.status(200).json({
            message: "Image uploaded successfully",
            url: uploadImage.secure_url,
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed", details: error.message });
    }
}

module.exports = updateImage;

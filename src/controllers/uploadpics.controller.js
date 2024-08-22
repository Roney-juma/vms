const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');
require("dotenv").config();

const imageUpload = async (req, res) => {
    try {

        AWS.config.update({
            accessKeyId: process.env.SECRET_ID_AWS,
            secretAccessKey: process.env.SECRET_KEY_AWS,
            region: process.env.AWS_REGION,
        });

        const s3 = new AWS.S3({ httpOptions: { timeout: 60000000 } });
        const file = req.file;
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `/ave/image-attachment_${Date.now()}_${file.originalname}/${file.originalname}`,
            Body: req.file.buffer,
            ACL: 'public-read',
            ContentType: file.mimetype,
        };

        s3.upload(params, (err, data) => {
            if (err) {
                throw err;
            }
            if (data) {
                return res.status(201).json({ data: data.Location });
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server side error' });
    }
};

module.exports = {
    imageUpload
}
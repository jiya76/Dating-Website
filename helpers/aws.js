const aws = require('aws-sdk')
const multer = require('multer')
const multer3 = require('multer-s3');
const keys = require('../config/keys');

aws.config.update({
    accessKeyId: keys.AWSAccessKeyID,
    secretAccessKey: keys.AWSAccessKeySecret
});

module.exports = {
    uploadImage: multer({
        storage: multers3({
            s3: new aws.S3({}),
            bucket: 'snuggle-dating-app',
            acl: 'public-read',
            metadata: (req,file,cb) => {
                cb(null,{fieldName: file.fieldname});
            },
            key: (req,file,cb) => {
                cb(null,file.originalName);
            },
            rename: (fieldName,fileName) => {
                return fileName.replace(/\w+/g,'-').toLowerCase();
            }        
        })
    })
};


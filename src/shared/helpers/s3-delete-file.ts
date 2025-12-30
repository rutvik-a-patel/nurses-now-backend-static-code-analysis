import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3DeleteFile = async (image: string) => {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const params = {
      Bucket: process.env.S3_IMAGE_BUCKET,
      Key: image,
    };

    const data = await s3.send(new DeleteObjectCommand(params));
    return data;
  } catch (err) {
    throw new Error(err);
  }
};

export default s3DeleteFile;

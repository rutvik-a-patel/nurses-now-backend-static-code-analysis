import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3GetFile = async (filePath: string): Promise<string> => {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const headCommand = new HeadObjectCommand({
      Bucket: process.env.S3_IMAGE_BUCKET,
      Key: filePath,
    });

    await s3.send(headCommand);
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_IMAGE_BUCKET,
      Key: filePath,
    });

    const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 }); // e.g., 1 hour expiry
    return url;
  } catch (_error) {
    return '';
  }
};

export default s3GetFile;

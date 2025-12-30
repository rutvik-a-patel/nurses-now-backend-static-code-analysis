import * as fs from 'fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export default async (
  name: string,
  destination: string,
  pathStr: string | undefined,
  filetype: string,
) => {
  return new Promise(async (resolve, reject) => {
    const stream = fs.createReadStream(`./${destination}`);
    const params = {
      Bucket: process.env.S3_IMAGE_BUCKET,
      Key: pathStr != undefined ? `${pathStr}/${name}` : name,
      Body: stream,
      ContentType: filetype,
    };
    // Create AWS S3 client
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    try {
      const command = new PutObjectCommand(params);
      const data = await s3.send(command);
      fs.unlinkSync(`./${destination}`);
      resolve({ name, destination, pathStr });
      return data;
    } catch (error) {
      reject(error);
    }
  });
};

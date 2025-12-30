// pdf.service.ts
import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';

@Injectable()
export class PdfService {
  async convertImageToPdf(
    imagePath: string,
    outputPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // Adjust image position and size as needed
      try {
        doc.image(imagePath, {
          fit: [500, 700],
          align: 'center',
          valign: 'center',
        });
      } catch (error) {
        reject(error);
        doc.end();
        throw new UnsupportedMediaTypeException('Invalid file format');
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }
}

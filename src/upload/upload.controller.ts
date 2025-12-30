import {
  Controller,
  Post,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as crypto from 'crypto';
import { diskStorage } from 'multer';
import s3UploadFile from '@/shared/helpers/s3-upload-file';
import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import * as fs from 'fs';
import { CreateUploadDto } from './dto/create-upload-validation';
import { DeleteImageDto } from './dto/delete-image.dto';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import { PdfService } from '@/shared/helpers/pdf-service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
  'image/png',
];
const ALLOWED_DOCUMENT_MIME_TYPE = [
  'application/pdf',
  ...ALLOWED_IMAGE_MIME_TYPES,
];

const ALLOWED_CHAT_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

@Controller('upload')
export class UploadController {
  constructor(private readonly pdfService: PdfService) {}

  unlinkIfExist(fileName: string) {
    const filePath = __dirname + `/../../../public/${fileName}`;
    if (filePath.match(/\.\.\//g) !== null && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/image',
        filename: (req, file, cb) => {
          const pathStr = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
          cb(null, pathStr);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_DOCUMENT_MIME_TYPE.includes(file.mimetype)) {
          return cb(
            new BadRequestException(CONSTANT.ERROR.ALLOWED_FILE_TYPE),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto,
  ) {
    try {
      if (file) {
        const folder = createUploadDto.folder;
        await s3UploadFile(file.filename, file.path, folder, file?.mimetype);
      } else {
        const data = {
          message: CONSTANT.VALIDATION.REQUIRED('Image'),
          data: {},
        };
        return response.validationError(data);
      }

      this.unlinkIfExist(`image/${file.filename}`);
      const image = {
        image: createUploadDto.folder + '/' + file.filename,
      };
      const data = {
        message: CONSTANT.SUCCESS.FILE_UPLOADED('Image'),
        data: image,
      };
      return response.successCreate(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Post('bulk-image')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: 'public/image',
        filename: (req, file, cb) => {
          const pathStr = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
          cb(null, pathStr);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(CONSTANT.ERROR.ALLOWED_FILE_TYPE),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async bulkCreate(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createUploadDto: CreateUploadDto,
  ) {
    try {
      const images = [];
      for (const file of files) {
        if (file) {
          const folder = createUploadDto.folder;
          await s3UploadFile(file.filename, file.path, folder, file?.mimetype);
        } else {
          const data = {
            message: CONSTANT.VALIDATION.REQUIRED('Image'),
            data: {},
          };
          return response.validationError(data);
        }
        images.push(createUploadDto.folder + '/' + file.filename);

        // Remove the file after processing
        this.unlinkIfExist(`image/${file.filename}`);
      }
      const data = {
        message: CONSTANT.SUCCESS.FILE_UPLOADED('Images'),
        data: { images },
      };
      return response.successCreate(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Post('document')
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: 'public/document',
        filename: (req, file, cb) => {
          const pathStr = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
          cb(null, pathStr);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_DOCUMENT_MIME_TYPE.includes(file.mimetype)) {
          return cb(
            new BadRequestException(CONSTANT.ERROR.ALLOWED_DOCUMENT_TYPE),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async createDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto,
  ) {
    try {
      if (file) {
        const { folder } = createUploadDto;
        if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
          const imagePath = path.resolve(file.path);
          file.filename = `${crypto.randomUUID()}.pdf`;
          file.mimetype = 'application/pdf';
          const outputDir = path.resolve('public/pdf');
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const outputPath = path.join(outputDir, file.filename);
          file.path = path.join('public/pdf', file.filename);

          try {
            await this.pdfService.convertImageToPdf(imagePath, outputPath);
          } catch (_error) {
            this.unlinkIfExist(imagePath);
            return response.invalidFileFormatException();
          }
        }

        await s3UploadFile(file.filename, file.path, folder, file.mimetype);
      } else {
        const data = {
          message: CONSTANT.VALIDATION.REQUIRED('Document'),
          data: {},
        };
        return response.validationError(data);
      }
      this.unlinkIfExist(`document/${file.filename}`);

      const image = {
        base_url: process.env.AWS_ASSETS_PATH,
        image: createUploadDto.folder + '/' + file.filename,
      };
      const data = {
        message: CONSTANT.SUCCESS.FILE_UPLOADED('Document'),
        data: image,
      };
      return response.successCreate(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Post('chat')
  @UseInterceptors(
    FileInterceptor('chat', {
      storage: diskStorage({
        destination: 'public/chat',
        filename: (req, file, cb) => {
          const pathStr = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
          cb(null, pathStr);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_CHAT_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(CONSTANT.ERROR.ALLOWED_DOCUMENT_TYPE),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUploadDto: CreateUploadDto,
  ) {
    try {
      if (file) {
        const folder = createUploadDto.folder;
        await s3UploadFile(file.filename, file.path, folder, file?.mimetype);
      } else {
        const data = {
          message: CONSTANT.VALIDATION.REQUIRED('File'),
          data: {},
        };
        return response.validationError(data);
      }
      this.unlinkIfExist(`chat/${file.filename}`);

      const image = {
        image: createUploadDto.folder + '/' + file.filename,
      };
      const data = {
        message: CONSTANT.SUCCESS.FILE_UPLOADED('File'),
        data: image,
      };
      return response.successCreate(data);
    } catch (error) {
      return response.failureResponse(error);
    }
  }

  @Delete('image')
  async deleteImage(@Body() deleteImageDto: DeleteImageDto) {
    try {
      await s3DeleteFile(deleteImageDto.image);
      return response.successResponse({
        message: CONSTANT.SUCCESS.FILE_DELETED('Asset'),
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

jest.mock('@/shared/helpers/s3-delete-file', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));
jest.mock('@/shared/helpers/s3-upload-file', () => ({
  __esModule: true, // This helps Jest understand that the module is an ES module
  default: jest.fn().mockResolvedValue(true), // Mocking the default export as a function
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { INestApplication } from '@nestjs/common';
import * as crypto from 'crypto';
import response from '@/shared/response';
import { CONSTANT } from '@/shared/constants/message';
import { CreateUploadDto } from './dto/create-upload-validation';
import { DeleteImageDto } from './dto/delete-image.dto';
import s3DeleteFile from '@/shared/helpers/s3-delete-file';
import s3UploadFile from '@/shared/helpers/s3-upload-file';
import * as request from 'supertest';
import * as fs from 'fs';
import { PdfService } from '@/shared/helpers/pdf-service';

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    promises: {
      ...actualFs.promises,
      readFile: jest.fn().mockResolvedValue('mocked file content'),
      unlinkSync: jest.fn(),
    },
  };
});

jest.mock('@/shared/helpers/s3-upload-file');
jest.mock('@/shared/helpers/s3-delete-file');
jest.mock('@/shared/response');

describe('UploadController', () => {
  let controller: UploadController;
  let s3DeleteHelper: any;
  let s3UploadHelper: any;
  let app: INestApplication;
  let pdfService: PdfService;

  beforeEach(async () => {
    pdfService = {
      convertImageToPdf: jest.fn().mockResolvedValue(true),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: PdfService, useValue: pdfService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    controller = module.get<UploadController>(UploadController);
    s3DeleteHelper = s3DeleteFile as jest.MockedFunction<typeof s3DeleteFile>;
    s3UploadHelper = s3UploadFile as jest.MockedFunction<typeof s3UploadFile>;

    jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue(`string-string-string-string-string`);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('should call fs.unlinkSync when file exists and filePath is valid', () => {
    const fileName = 'testFile.txt';
    const filePath = __dirname + `/../../../public/${fileName}`;
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'unlinkSync').mockImplementation(jest.fn());

    controller.unlinkIfExist(fileName);

    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
    expect(fs.unlinkSync).toHaveBeenCalledWith(filePath);
  });

  describe('create', () => {
    const createUploadDto = new CreateUploadDto();
    it('should upload a valid image', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 5000,
        filename: 'mocked-uuid.jpg',
        path: 'public/image/mocked-uuid.jpg',
      } as Express.Multer.File;

      s3UploadHelper.mockResolvedValue();
      const result = await controller.create(mockFile, createUploadDto);

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.FILE_UPLOADED('Image'),
          data: {
            image: expect.any(String),
          },
        }),
      );
    });

    it('should upload a valid image', async () => {
      return request(app.getHttpServer())
        .post('/upload/image')
        .field('folder', 'test-folder')
        .attach('image', Buffer.from('test-image-content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({});
        });
    });

    it('should upload a valid image', async () => {
      return request(app.getHttpServer())
        .post('/upload/image')
        .field('folder', 'test-folder')
        .attach('image', Buffer.from('test-image-content'), {
          filename: 'test.txt',
          contentType: 'plain/text',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Bad Request',
            message: CONSTANT.ERROR.ALLOWED_FILE_TYPE,
            statusCode: 400,
          });
        });
    });

    it('should return validation error if file not exist', async () => {
      const result = await controller.create(null, createUploadDto);

      expect(result).toEqual(
        response.validationError({
          message: CONSTANT.VALIDATION.REQUIRED('Image'),
          data: {},
        }),
      );
    });

    it('should handle exception and return failure response', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 5000,
        filename: 'mocked-uuid.jpg',
        path: 'public/image/mocked-uuid.jpg',
      } as Express.Multer.File;

      const errorMessage = 'S3 upload failed';

      s3UploadHelper.mockRejectedValue(new Error(errorMessage));
      const result = await controller.create(mockFile, createUploadDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('bulkCreate', () => {
    const createUploadDto = new CreateUploadDto();

    it('should upload multiple valid images', async () => {
      return request(app.getHttpServer())
        .post('/upload/bulk-image')
        .field('folder', 'test-folder')
        .attach('images', Buffer.from('test-image-content'), {
          filename: 'test1.jpg',
          contentType: 'image/jpeg',
        })
        .attach('images', Buffer.from('test-image-content'), {
          filename: 'test2.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({});
        });
    });

    it('should upload multiple valid images', async () => {
      return request(app.getHttpServer())
        .post('/upload/bulk-image')
        .field('folder', 'test-folder')
        .attach('images', Buffer.from('test-image-content'), {
          filename: 'test1.txt',
          contentType: 'plain/text',
        })
        .attach('images', Buffer.from('test-image-content'), {
          filename: 'test2.txt',
          contentType: 'plain/text',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Bad Request',
            message: CONSTANT.ERROR.ALLOWED_FILE_TYPE,
            statusCode: 400,
          });
        });
    });

    it('should upload multiple valid images', async () => {
      const mockFiles = [
        {
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg',
          size: 5000,
          filename: 'mocked-uuid1.jpg',
          path: 'public/image/mocked-uuid1.jpg',
        },
        {
          originalname: 'test2.jpg',
          mimetype: 'image/jpeg',
          size: 5000,
          filename: 'mocked-uuid2.jpg',
          path: 'public/image/mocked-uuid2.jpg',
        },
      ] as Express.Multer.File[];

      s3UploadHelper.mockResolvedValueOnce();
      s3UploadHelper.mockResolvedValueOnce();
      const result = await controller.bulkCreate(mockFiles, createUploadDto);

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.FILE_UPLOADED('Images'),
          data: {
            images: [expect.any(String), expect.any(String)],
          },
        }),
      );
    });

    it('should return an error is not file', async () => {
      const result = await controller.bulkCreate([null], createUploadDto);

      expect(result).toEqual(
        response.validationError({
          message: CONSTANT.VALIDATION.REQUIRED('Image'),
          data: {},
        }),
      );
    });

    it('should handle exception and return failure response', async () => {
      const mockFiles = [
        {
          originalname: 'test1.jpg',
          mimetype: 'image/jpeg',
          size: 5000,
          filename: 'mocked-uuid1.jpg',
          path: 'public/image/mocked-uuid1.jpg',
        },
        {
          originalname: 'test2.jpg',
          mimetype: 'image/jpeg',
          size: 5000,
          filename: 'mocked-uuid2.jpg',
          path: 'public/image/mocked-uuid2.jpg',
        },
      ] as Express.Multer.File[];

      const errorMessage = 'S3 upload failed';

      s3UploadHelper.mockRejectedValue(new Error(errorMessage));
      const result = await controller.bulkCreate(mockFiles, createUploadDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('createDocument', () => {
    const createUploadDto = new CreateUploadDto();

    it('should upload a valid image', async () => {
      return request(app.getHttpServer())
        .post('/upload/document')
        .field('folder', 'test-folder')
        .attach('document', Buffer.from('test-image-content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({});
        });
    });

    it('should upload a valid image', async () => {
      return request(app.getHttpServer())
        .post('/upload/document')
        .field('folder', 'test-folder')
        .attach('document', Buffer.from('test-image-content'), {
          filename: 'test.txt',
          contentType: 'plain/text',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Bad Request',
            message: CONSTANT.ERROR.ALLOWED_DOCUMENT_TYPE,
            statusCode: 400,
          });
        });
    });

    it('should upload a valid document', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 5000,
        filename: 'mocked-uuid.pdf',
        path: 'public/document/mocked-uuid.pdf',
      } as Express.Multer.File;

      s3UploadHelper.mockResolvedValue();
      const result = await controller.createDocument(mockFile, createUploadDto);

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.FILE_UPLOADED('Document'),
          data: {
            image: expect.any(String),
          },
        }),
      );
    });

    it('should return an error is not file', async () => {
      const result = await controller.createDocument(null, createUploadDto);

      expect(result).toEqual(
        response.validationError({
          message: CONSTANT.VALIDATION.REQUIRED('Document'),
          data: {},
        }),
      );
    });

    it('should handle exception and return failure response', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 5000,
        filename: 'mocked-uuid.pdf',
        path: 'public/document/mocked-uuid.pdf',
      } as Express.Multer.File;

      const errorMessage = 'S3 upload failed';

      s3UploadHelper.mockRejectedValue(new Error(errorMessage));
      const result = await controller.createDocument(mockFile, createUploadDto);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('uploadAttachment', () => {
    const createUploadDto = new CreateUploadDto();

    it('should upload a valid image', async () => {
      return request(app.getHttpServer())
        .post('/upload/chat')
        .field('folder', 'test-folder')
        .attach('chat', Buffer.from('test-image-content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({});
        });
    });

    it('should upload a valid image', async () => {
      return request(app.getHttpServer())
        .post('/upload/chat')
        .field('folder', 'test-folder')
        .attach('chat', Buffer.from('test-image-content'), {
          filename: 'test.txt',
          contentType: 'plain/text',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Bad Request',
            message: CONSTANT.ERROR.ALLOWED_DOCUMENT_TYPE,
            statusCode: 400,
          });
        });
    });

    it('should upload a valid document', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 5000,
        filename: 'mocked-uuid.pdf',
        path: 'public/chat/mocked-uuid.pdf',
      } as Express.Multer.File;

      s3UploadHelper.mockResolvedValue();
      const result = await controller.uploadAttachment(
        mockFile,
        createUploadDto,
      );

      expect(result).toEqual(
        response.successCreate({
          message: CONSTANT.SUCCESS.FILE_UPLOADED('File'),
          data: {
            image: expect.any(String),
          },
        }),
      );
    });

    it('should return an error is not file', async () => {
      const result = await controller.uploadAttachment(null, createUploadDto);

      expect(result).toEqual(
        response.validationError({
          message: CONSTANT.VALIDATION.REQUIRED('File'),
          data: {},
        }),
      );
    });

    it('should handle exception and return failure response', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 5000,
        filename: 'mocked-uuid.pdf',
        path: 'public/chat/mocked-uuid.pdf',
      } as Express.Multer.File;

      const errorMessage = 'S3 upload failed';

      s3UploadHelper.mockRejectedValue(new Error(errorMessage));
      const result = await controller.uploadAttachment(
        mockFile,
        createUploadDto,
      );
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });

  describe('deleteImage', () => {
    const deleteImageDto = new DeleteImageDto();
    deleteImageDto.image = 'mocked-image-path.jpg';

    it('should delete the image successfully', async () => {
      s3DeleteHelper.mockResolvedValue(true);

      const result = await controller.deleteImage(deleteImageDto);

      expect(s3DeleteHelper).toHaveBeenCalledWith(deleteImageDto.image);
      expect(result).toEqual(
        response.successResponse({
          message: CONSTANT.SUCCESS.FILE_DELETED('Asset'),
          data: {},
        }),
      );
    });

    it('should return failure response if S3 delete fails', async () => {
      const errorMessage = 'S3 Delete Failed';
      s3DeleteHelper.mockRejectedValue(new Error(errorMessage));

      const result = await controller.deleteImage(deleteImageDto);
      expect(s3DeleteHelper).toHaveBeenCalledWith(deleteImageDto.image);
      expect(result).toEqual(response.failureResponse(new Error(errorMessage)));
    });
  });
});

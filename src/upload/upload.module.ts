import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
// import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { FileUploadException } from './file-upload-exception';
import { Provider } from '@/provider/entities/provider.entity';
import { Token } from '@/token/entities/token.entity';
import { PdfService } from '@/shared/helpers/pdf-service';

@Module({
  // providers: [
  //   {
  //     provide: APP_FILTER,
  //     useClass: FileUploadException,
  //   },
  // ],
  imports: [TypeOrmModule.forFeature([Provider, Token])],
  controllers: [UploadController],
  providers: [PdfService],
})
export class UploadModule {}

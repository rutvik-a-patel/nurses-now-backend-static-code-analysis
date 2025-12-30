import { Module } from '@nestjs/common';
import { ReferenceFormOptionService } from './reference-form-option.service';
import { ReferenceFormOptionController } from './reference-form-option.controller';

@Module({
  controllers: [ReferenceFormOptionController],
  providers: [ReferenceFormOptionService],
})
export class ReferenceFormOptionModule {}

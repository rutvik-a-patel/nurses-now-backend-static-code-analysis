import { Module } from '@nestjs/common';
import { ReferenceFormDesignService } from './reference-form-design.service';
import { ReferenceFormDesignController } from './reference-form-design.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferenceFormDesign } from './entities/reference-form-design.entity';
import { ReferenceFormOption } from '@/reference-form-option/entities/reference-form-option.entity';
import { ReferenceForm } from './entities/reference-form.entity';
import { ProviderProfessionalReference } from '@/provider-professional-reference/entities/provider-professional-reference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReferenceFormDesign,
      ReferenceFormOption,
      ReferenceForm,
      ProviderProfessionalReference,
    ]),
  ],
  controllers: [ReferenceFormDesignController],
  providers: [ReferenceFormDesignService],
})
export class ReferenceFormDesignModule {}

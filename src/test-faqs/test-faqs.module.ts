import { Module } from '@nestjs/common';
import { TestFaqsService } from './test-faqs.service';
import { TestFaqsController } from './test-faqs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestFaq } from './entities/test-faq.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestFaq])],
  controllers: [TestFaqsController],
  providers: [TestFaqsService],
})
export class TestFaqsModule {}

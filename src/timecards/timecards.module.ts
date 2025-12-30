import { Module } from '@nestjs/common';
import { TimecardsService } from './timecards.service';
import { TimecardsController } from './timecards.controller';
import { Timecard } from './entities/timecard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Timecard])],
  controllers: [TimecardsController],
  providers: [TimecardsService],
})
export class TimecardsModule {}

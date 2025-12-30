import { Module } from '@nestjs/common';
import { ShiftCancelReasonService } from './shift-cancel-reason.service';
import { ShiftCancelReasonController } from './shift-cancel-reason.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftCancelReason } from './entities/shift-cancel-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftCancelReason])],
  controllers: [ShiftCancelReasonController],
  providers: [ShiftCancelReasonService],
})
export class ShiftCancelReasonModule {}

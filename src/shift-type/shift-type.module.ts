import { Module } from '@nestjs/common';
import { ShiftTypeService } from './shift-type.service';
import { ShiftTypeController } from './shift-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftType } from './entities/shift-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftType])],
  controllers: [ShiftTypeController],
  providers: [ShiftTypeService],
})
export class ShiftTypeModule {}

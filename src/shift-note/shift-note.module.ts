import { Module } from '@nestjs/common';
import { ShiftNoteService } from './shift-note.service';
import { ShiftNoteController } from './shift-note.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftNote } from './entities/shift-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftNote])],
  controllers: [ShiftNoteController],
  providers: [ShiftNoteService],
})
export class ShiftNoteModule {}

import { Injectable } from '@nestjs/common';
import { CreateShiftNoteDto } from './dto/create-shift-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShiftNote } from './entities/shift-note.entity';
import { Repository, IsNull } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { UpdateShiftNoteDto } from './dto/update-shift-note.dto';
import { DeleteDto } from '@/shared/dto/delete.dto';

@Injectable()
export class ShiftNoteService {
  constructor(
    @InjectRepository(ShiftNote)
    private readonly shiftNoteRepository: Repository<ShiftNote>,
  ) {}

  async create(
    createShiftNoteDto: CreateShiftNoteDto,
    admin_id: string,
  ): Promise<ShiftNote> {
    const noteData = {
      notes: createShiftNoteDto.notes,
      shift: { id: createShiftNoteDto.shift_id },
      admin: { id: admin_id },
    };
    const note = plainToClass(ShiftNote, noteData);
    return await this.shiftNoteRepository.save(note);
  }

  async findByShiftId(
    shiftId: string,
    limit: number,
    offset: number,
  ): Promise<[ShiftNote[], number]> {
    const queryBuilder = this.shiftNoteRepository
      .createQueryBuilder('sn')
      .leftJoin('sn.admin', 'a')
      .select([
        'sn.id',
        'sn.notes',
        'sn.created_at',
        'a.id',
        'a.base_url',
        'a.image',
        'a.first_name',
        'a.last_name',
      ])
      .where('sn.shift_id = :shiftId', { shiftId })
      .orderBy('sn.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    const [notes, total] = await queryBuilder.getManyAndCount();
    return [notes, total];
  }

  async findOne(id: string): Promise<ShiftNote> {
    const note = await this.shiftNoteRepository.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      },
      relations: ['admin'],
    });
    return plainToClass(ShiftNote, note);
  }

  async update(id: string, updateShiftNoteDto: UpdateShiftNoteDto) {
    const record = await this.shiftNoteRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        ...updateShiftNoteDto,
        updated_at: new Date().toISOString(),
      },
    );
    return record;
  }

  async remove(id: string, deleteDto: DeleteDto) {
    const record = await this.shiftNoteRepository.update(
      { id: id, deleted_at: IsNull() },
      {
        deleted_at_ip: deleteDto.deleted_at_ip,
        deleted_at: new Date().toISOString(),
      },
    );
    return record;
  }
}

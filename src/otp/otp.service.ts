import { Injectable } from '@nestjs/common';
import { Otp } from './entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async findOne(where: FindOneOptions<Otp>) {
    const result = await this.otpRepository.findOne(where);
    return plainToClass(Otp, result);
  }

  async create(createOtpDto: CreateOtpDto) {
    const result = await this.otpRepository.save(createOtpDto);
    return plainToClass(Otp, result);
  }

  async update(id: string, updateOtpDto: UpdateOtpDto) {
    const result = await this.otpRepository.update(id, updateOtpDto);
    return plainToClass(Otp, result);
  }
}

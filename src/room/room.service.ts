import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { Provider } from '@/provider/entities/provider.entity';
import { CHAT_TABLE } from '@/shared/constants/enum';
import { Department } from '@/department/entities/department.entity';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { Repository } from 'typeorm';
import { Admin } from '@/admin/entities/admin.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(FacilityUser)
    private readonly facilityUserRepository: Repository<FacilityUser>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async getUserData(userId: string, userType: CHAT_TABLE) {
    const repositoryMap = {
      provider: this.providerRepository,
      facility: this.facilityRepository,
      facility_user: this.facilityUserRepository,
      admin: this.adminRepository,
      department: this.departmentRepository,
    };

    const selectFieldsMap = {
      provider: {
        id: true,
        first_name: true,
        last_name: true,
        base_url: true,
        profile_image: true,
        created_at: true,
      },
      facility: {
        id: true,
        name: true,
        base_url: true,
        image: true,
        created_at: true,
      },
      facility_user: {
        id: true,
        first_name: true,
        last_name: true,
        base_url: true,
        image: true,
        created_at: true,
      },
      admin: {
        id: true,
        first_name: true,
        last_name: true,
        base_url: true,
        image: true,
        created_at: true,
      },
      department: {
        id: true,
        name: true,
        base_url: true,
        image: true,
        created_at: true,
      },
    };

    const repository = repositoryMap[userType];
    const selectFields = selectFieldsMap[userType];

    const result = await repository.findOne({
      where: { id: userId },
      select: selectFields,
    });
    return result;
  }

  async isRoomExists(userId: string, senderId: string) {
    const data = await this.roomRepository.findOne({
      where: [
        {
          user_id: userId,
          sender_id: senderId,
        },
        {
          user_id: senderId,
          sender_id: userId,
        },
      ],
    });
    return plainToClass(Room, data);
  }

  async create(user: any, createRoomDto: CreateRoomDto) {
    const body = {
      user_id: user.id,
      user_type: user.role,
      sender_id: createRoomDto.sender_id,
      sender_type: createRoomDto.sender_type,
    };
    const result = await this.roomRepository.save(body);
    return plainToClass(Room, result);
  }
}

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Token } from '@/token/entities/token.entity';
import { ChatGateway } from './chat.gateway';
import { Provider } from '@/provider/entities/provider.entity';
import { Media } from '@/media/entities/media.entity';
import { Facility } from '@/facility/entities/facility.entity';
import { FacilityUser } from '@/facility-user/entities/facility-user.entity';
import { Admin } from '@/admin/entities/admin.entity';
import { Room } from '@/room/entities/room.entity';
import { Department } from '@/department/entities/department.entity';
import { UserNotification } from '@/user-notification/entities/user-notification.entity';
import { Shift } from '@/shift/entities/shift.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chat,
      Token,
      Provider,
      Media,
      Facility,
      FacilityUser,
      Admin,
      Room,
      Department,
      UserNotification,
      Shift,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}

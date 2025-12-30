import { Module } from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { UserNotificationController } from './user-notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from './entities/user-notification.entity';
import { Token } from '@/token/entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserNotification, Token])],
  controllers: [UserNotificationController],
  providers: [UserNotificationService],
})
export class UserNotificationModule {}

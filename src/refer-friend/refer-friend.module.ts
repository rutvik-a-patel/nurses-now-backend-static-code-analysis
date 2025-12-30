import { Module } from '@nestjs/common';
import { ReferFriendService } from './refer-friend.service';
import { ReferFriendController } from './refer-friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferFriend } from './entities/refer-friend.entity';
import { EncryptDecryptService } from '@/shared/helpers/encrypt-decrypt';

@Module({
  imports: [TypeOrmModule.forFeature([ReferFriend])],
  controllers: [ReferFriendController],
  providers: [ReferFriendService, EncryptDecryptService],
})
export class ReferFriendModule {}

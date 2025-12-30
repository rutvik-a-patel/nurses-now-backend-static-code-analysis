import { PartialType } from '@nestjs/mapped-types';
import { CreateReferFriendDto } from './create-refer-friend.dto';

export class UpdateReferFriendDto extends PartialType(CreateReferFriendDto) {}

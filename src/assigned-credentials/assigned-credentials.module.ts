import { Module } from '@nestjs/common';
import { AssignedCredentialsService } from './assigned-credentials.service';
import { AssignedCredentialsController } from './assigned-credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from '@/provider/entities/provider.entity';
import { AssignedCredential } from './entities/assigned-credential.entity';
import { Activity } from '@/activity/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssignedCredential, Provider, Activity])],
  controllers: [AssignedCredentialsController],
  providers: [AssignedCredentialsService],
})
export class AssignedCredentialsModule {}

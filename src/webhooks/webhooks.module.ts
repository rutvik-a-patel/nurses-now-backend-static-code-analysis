import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './entity/webhook.entity';
import { Provider } from '@/provider/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, Provider])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}

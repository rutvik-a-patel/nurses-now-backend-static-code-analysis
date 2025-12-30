import { Body, Controller, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import response from '@/shared/response';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async handleWebhookEvent(@Body() payload: any) {
    try {
      await this.webhooksService.handleEncryptedWebhook(payload);

      return response.successResponse({
        message: 'Webhook processed successfully.',
        data: {},
      });
    } catch (error) {
      return response.failureResponse(error);
    }
  }
}

import logger from '@/shared/helpers/logger';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Webhook } from './entity/webhook.entity';
import { plainToInstance } from 'class-transformer';
import { Provider } from '@/provider/entities/provider.entity';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async handleEncryptedWebhook(payload: any) {
    const base64Key = this.configService.get<string>(
      'BRANCH_AES_ENCRYPTION_KEY',
    );

    if (!base64Key) {
      throw new InternalServerErrorException(
        'AES encryption key not configured.',
      );
    }

    try {
      const decryptedString = this.decrypt(payload.data, base64Key);
      const savedWebhook = await this.saveWebhookData(payload, decryptedString);
      return savedWebhook;
    } catch (error) {
      logger.error('Webhook decryption or parsing failed:', error.message);
      throw new InternalServerErrorException(
        'Invalid or un-decryptable data provided in webhook payload.',
      );
    }
  }

  private decrypt(base64EncryptedValue: string, base64Key: string): string {
    const encryptedByteValue = Buffer.from(base64EncryptedValue, 'base64');
    const key = Buffer.from(base64Key, 'base64');

    const iv = encryptedByteValue.subarray(0, 16);
    const value = encryptedByteValue.subarray(16, encryptedByteValue.length);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(value, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async saveWebhookData(payload: any, decryptedData: string): Promise<Webhook> {
    const parsedData = JSON.parse(decryptedData);
    const webhookData = plainToInstance(Webhook, {
      event_id: payload.event_id,
      event: payload.event,
      client_type: payload.client_type,
      client_id: payload.client_id,
      data: payload.data,
      employee_id: parsedData.employee_id,
      active_type: parsedData.active_type,
      time_emitted: parsedData.time_emitted,
      response: decryptedData,
    });

    const webhook = await this.webhookRepository.save({
      ...webhookData,
      created_at_ip: payload.created_at_ip,
      updated_at_ip: payload.updated_at_ip,
    });

    if (payload.event === 'PAYMENT_PROFILE_ACTIVATED') {
      await this.providerRepository.update(parsedData.employee_id, {
        is_payment_setup_completed: true,
      });
    }

    if (payload.event === 'PAYMENT_PROFILE_DEACTIVATED') {
      await this.providerRepository.update(parsedData.employee_id, {
        is_payment_setup_completed: false,
      });
    }

    return plainToInstance(Webhook, webhook);
  }
}

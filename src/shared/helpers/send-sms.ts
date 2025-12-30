import { Twilio } from 'twilio';
import logger from './logger';

interface SmsOptions {
  contactNumber: string;
  otp: number;
}

export class SmsService {
  private accountSid = process.env.TWILIO_ACCOUNT_SID;
  private authToken = process.env.TWILIO_AUTH_TOKEN;
  private twilioNumber = process.env.TWILIO_PHONE_NUMBER;
  private client = new Twilio(this.accountSid, this.authToken);
  async sendSms(smsOptions: SmsOptions) {
    // Sending OTP only on production environment because for all other environment OTP is static (123456)
    if (process.env.NODE_ENV === 'production') {
      this.client.messages.create(
        {
          from: this.twilioNumber,
          to: smsOptions.contactNumber,
          body: `Your Assist Healthcare Verification OTP is: ${smsOptions.otp}\nThis OTP is valid for the next 10 minutes\nPlease do not share the OTP with anyone.`,
        },
        (error: Error | null, _item?: any) => {
          if (error) {
            logger.error(
              `Twillio ERROR ${new Date().toLocaleString('es-CL')} ${error.message}`,
            );
          }
        },
      );
    }
  }
}

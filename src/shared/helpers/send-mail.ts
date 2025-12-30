import { createTransport, Transporter } from 'nodemailer';
import logger from './logger';
import { MEDIA_FOLDER } from '../constants/enum';

interface mailOptions {
  from?: string;
  to: string | Array<string>;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | Array<string>;
  bcc?: string | Array<string>;
  attachments?: {
    filename?: string | false | undefined;
    content?: string | Buffer | undefined;
    path?: string | undefined;
    folder?: string; // ! Create Enum for folder
    contentType?: string | undefined;
  }[];
}
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      // service: process.env.SMTP_SERVICE,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(mailOptions: mailOptions) {
    if (!mailOptions?.from) {
      const fromEmail = process.env.SMTP_FROM;
      Object.assign(mailOptions, { from: `NursesNow <${fromEmail}>` });
    }

    this.transporter.sendMail(mailOptions, (err: Error | null, _info: any) => {
      if (err) {
        logger.error(`${new Date().toLocaleString('es-CL')} ${err.message}`);
      } else {
        if (
          mailOptions.attachments !== undefined &&
          mailOptions.attachments.length > 0
        ) {
          mailOptions.attachments.forEach((element) => {
            switch (element.folder) {
              case MEDIA_FOLDER.credential:
                break;

              default:
                // Log a message for an unknown folder
                const logMessage = `Warning: Unable to determine the folder for file '${element.filename}' with path '${element.path}'. This file may not have been removed from the server.`;
                logger.error(
                  `${new Date().toLocaleString('es-CL')} ${logMessage}`,
                );
                break;
            }
          });
        }
      }
    });
  }
}

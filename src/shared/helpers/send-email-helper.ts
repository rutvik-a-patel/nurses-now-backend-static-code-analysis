import { SEND_EMAIL } from '../constants/types';
import { EmailService } from './send-mail';
import { renderFile } from 'ejs';
import { join } from 'path';
import getDefaultImages from './get-default-images';

const sendEmailHelper = async (payload: SEND_EMAIL) => {
  const emailService = new EmailService();
  const defaultImages = getDefaultImages();
  const ejsTemplate = await renderFile(
    join(
      __dirname +
        `/../../../../src/shared/ejs-templates/${payload.email_type}.ejs`,
    ),
    {
      name: payload.name,
      shiftData: payload.shiftData ? payload.shiftData : {},
      minutes: payload.minutes || 10,
      hours: payload.hours || 1,
      otp: payload.otp,
      redirectUrl: payload.redirectUrl,
      defaultImages,
      supportEmail: payload.supportEmail,
      authority: payload.authority,
      data: payload.data,
    },
  );

  await emailService.sendMail({
    to: payload.email,
    cc: payload?.cc_email,
    subject: payload.subject,
    html: ejsTemplate,
    attachments: payload.attachments,
  });
  return payload;
};

export default sendEmailHelper;

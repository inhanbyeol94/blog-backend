import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { config } from '../_common/config';

@Injectable()
export class SmsService {
  /* 인증번호 SMS 발송 */
  async sendAuthcode(phoneNumber: string, authCode: string): Promise<void> {
    const message = `[${config.blog}] 인증번호는 ${authCode} 입니다.`;
    await this.send(phoneNumber, message);
  }

  /* SMS 발송 */
  async send(phoneNumber: string, content: string): Promise<void> {
    try {
      const message = [];
      const accessKey = process.env.SMS_ACCESS_KEY;
      const secretKey = process.env.SMS_SECRET_KEY;

      const hmac = crypto.createHmac('sha256', secretKey);

      const url = process.env.SMS_URL;
      const uri = process.env.SMS_URI;
      const method = 'POST';
      const space = ' ';
      const newLine = '\n';
      const timestamp = Date.now().toString();

      message.push(method);
      message.push(space);
      message.push(uri);
      message.push(newLine);
      message.push(timestamp);
      message.push(newLine);
      message.push(accessKey);

      const signature = hmac.update(message.join('')).digest('base64').toString();

      await fetch(url + uri, {
        method,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': timestamp,
          'x-ncp-iam-access-key': accessKey,
          'x-ncp-apigw-signature-v2': signature,
        },
        body: JSON.stringify({
          type: 'SMS',
          contentType: 'COMM',
          countryCode: '82',
          from: process.env.SMS_FROM_NUMBER,
          content,
          messages: [
            {
              to: phoneNumber.replaceAll('-', ''),
            },
          ],
        }),
      });
    } catch {}
  }
}

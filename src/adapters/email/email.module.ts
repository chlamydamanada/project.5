import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { MailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: 'gmail', // to send emails from gmail??
          //host: 'smtp.example.com',
          //secure: false,
          auth: {
            user: config.get('MY_EMAIL'), //  is email from will be sent letter
            pass: config.get('PASS'), //  password in gmail security
          },
        },
        defaults: {
          from: '"Kek 👻" <codeSender>', // sender address
        },
        template: {
          dir: join(__dirname, 'templates'), //?????
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for controllers or services
})
export class MailModule {}

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, Transporter } from 'nodemailer'

export interface SendEmailBody {
  to: string
  subject: string
  html: string
}

@Injectable()
export class EmailService {
  transporter: Transporter

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get('nodemailer_host'),
      port: configService.get('nodemailer_port'),
      secure: false,
      auth: {
        user: configService.get('nodemailer_auth_user'),
        pass: configService.get('nodemailer_auth_pass'),
      },
    })
  }

  async send(body: SendEmailBody) {
    const { to, subject, html } = body

    await this.transporter.sendMail({
      from: {
        name: this.configService.get('nodemailer_name'),
        address: this.configService.get('nodemailer_auth_user'),
      },
      to,
      subject,
      html,
    })
  }
}

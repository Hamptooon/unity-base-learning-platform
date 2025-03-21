import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
	private transporter

	constructor(private configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get<string>('EMAIL_HOST'),
			port: this.configService.get<number>('EMAIL_PORT'),
			secure: this.configService.get<number>('EMAIL_PORT') === 465,
			auth: {
				user: this.configService.get<string>('EMAIL_USER'),
				pass: this.configService.get<string>('EMAIL_PASSWORD')
			}
		})
	}

	async sendVerificationEmail(email: string, token: string, name: string) {
		const frontendUrl = this.configService.get<string>('FRONTEND_URL')
		const verificationUrl = `${frontendUrl}/auth/verify-email?emailVerificationToken=${token}`
		try {
			console.log('Send email!!')
			await this.transporter.sendMail({
				from: `"Ваш сайт" <${this.configService.get<string>('EMAIL_USER')}>`,
				to: email,
				subject: 'Подтверждение email',
				html: `
			<div>
			  <h1>Привет, ${name}!</h1>
			  <p>Спасибо за регистрацию на нашем сайте. Пожалуйста, подтвердите ваш email, перейдя по ссылке ниже:</p>
			  <a href="${verificationUrl}">Подтвердить email</a>
			  <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
			</div>
		  `
			})
		} catch (error) {
			console.log('ERROR EMAIL')
			console.log(error)
		}
	}
}

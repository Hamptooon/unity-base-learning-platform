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
			await this.transporter.sendMail({
				from: `"Unity Mentor" <${this.configService.get<string>('EMAIL_USER')}>`,
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

	async sendNotificationCourseTaskCheck(
		email: string,
		courseId: string,
		taskId: string
	) {
		const frontendUrl = this.configService.get<string>('FRONTEND_URL')
		const taskUrl = `${frontendUrl}/courses/${courseId}/${taskId}`
		try {
			await this.transporter.sendMail({
				from: `"Unity Mentor" <${this.configService.get<string>('EMAIL_USER')}>`,
				to: email,
				subject: 'Проверка задания курса',
				html: `
				<div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 40px 0;">
				  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
					<tr>
					  <td style="padding: 32px 40px 24px 40px;">
						<h1 style="color: #2d3748; font-size: 24px; margin-bottom: 16px;">Проверка задания курса</h1>
						<p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
						  Ваше задание было проверено! Пожалуйста, перейдите по ссылке ниже, чтобы просмотреть результаты и комментарии преподавателя.
						</p>
						<a href="${taskUrl}" style="display: inline-block; padding: 12px 28px; background: #4f46e5; color: #fff; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
						  Просмотреть результаты
						</a>
						<p style="color: #a0aec0; font-size: 13px; margin-top: 32px;">
						  Если вы не ожидаете это письмо, просто проигнорируйте его.
						</p>
					  </td>
					</tr>
				  </table>
				  <p style="text-align: center; color: #b0b0b0; font-size: 12px; margin-top: 24px;">
					С уважением, команда Unity Mentor
				  </p>
				</div>
				`
			})
		} catch (error) {
			console.log('ERROR EMAIL')
			console.log(error)
		}
	}
}

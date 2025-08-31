import {
	Injectable,
	UnauthorizedException,
	BadRequestException,
	Inject,
	forwardRef
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../user/user.service'
import { EmailService } from '../email/email.service'
import { Role, User } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		@Inject(forwardRef(() => UsersService))
		private usersService: UsersService,
		private emailService: EmailService
	) {}

	// Валидация GitHub пользователя (при логине через GitHub)
	async validateGithubUser(githubUser: {
		githubId: string
		email: string
		name: string
		avatarUrl: string
		bio: string
	}): Promise<User> {
		// Проверяем, существует ли пользователь по GitHub ID
		let user = await this.usersService.findByGithubId(githubUser.githubId)

		// Если пользователь не найден, создаем нового
		if (!user) {
			const verificationToken = uuidv4()
			user = await this.usersService.createGithubUser(
				githubUser,
				verificationToken
			)

			// Отправляем email для подтверждения
			await this.emailService.sendVerificationEmail(
				githubUser.email,
				verificationToken,
				githubUser.name || 'пользователь'
			)
		}

		return user
	}

	// Генерация JWT токена
	async generateToken(user: any) {
		const payload = {
			sub: user.id,
			email: user.email,
			role: user.role,
			emailVerified: user.emailVerified
		}

		return {
			accessToken: this.jwtService.sign(payload, {
				expiresIn: '20h'
			}),
			refreshToken: this.jwtService.sign(payload, {
				expiresIn: '7d'
			})
		}
	}
	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)
		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost', // вынести в env
			sameSite: 'lax',
			secure: true, // если HTTPS
			expires: expiresIn
		})
	}

	removeRefreshToken(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			domain: 'localhost', // вынести в env
			expires: new Date(0),
			secure: true,
			sameSite: 'lax'
		})
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwtService.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid refresh token')
		const user = await this.usersService.findById(result.sub)
		const tokens = await this.generateToken(user)
		console.log('generateNewTokens')
		return {
			user,
			...tokens
		}
	}
	// Подтверждение email
	async verifyEmail(token: string) {
		const user = await this.prisma.user.findFirst({
			where: { emailVerificationToken: token }
		})

		if (!user) {
			throw new BadRequestException('Недействительный токен подтверждения')
		}

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerified: true,
				emailVerificationToken: null
			}
		})

		return { success: true }
	}

	// Повторная отправка письма для подтверждения
	async resendVerificationEmail(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		})
		console.log('resendVerificationEmail')
		if (!user) {
			throw new BadRequestException('Пользователь не найден')
		}

		if (user.emailVerified) {
			throw new BadRequestException('Email уже подтвержден')
		}

		const verificationToken = uuidv4()

		await this.prisma.user.update({
			where: { id: user.id },
			data: { emailVerificationToken: verificationToken, emailVerified: false }
		})

		await this.emailService.sendVerificationEmail(
			user.email,
			verificationToken,
			user.name || 'пользователь'
		)

		return { success: true }
	}
	async resendVerificationChangeEmail(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId }
		})
		console.log('resendVerificationChangeEmail')
		if (!user) {
			throw new BadRequestException('Пользователь не найден')
		}

		const verificationToken = uuidv4()

		await this.prisma.user.update({
			where: { id: user.id },
			data: { emailVerificationToken: verificationToken, emailVerified: false }
		})

		await this.emailService.sendVerificationEmail(
			user.email,
			verificationToken,
			user.name || 'пользователь'
		)

		return { success: true }
	}
}

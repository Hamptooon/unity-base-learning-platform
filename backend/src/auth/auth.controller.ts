import {
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
	Query,
	Body,
	UnauthorizedException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { Response, Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { CurrentUser } from './decorators/current-user.decorator'
import { User } from '@prisma/client'
import { EmailService } from '@/email/email.service'

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: ConfigService
	) {}

	// Инициирование GitHub аутентификации
	@Get('github')
	@UseGuards(AuthGuard('github'))
	githubAuth() {
		// Этот метод не будет выполнен, так как GitHub перенаправит пользователя
	}

	// Обработка callback от GitHub
	@Get('github/callback')
	@UseGuards(AuthGuard('github'))
	async githubAuthCallback(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken } = await this.authService.generateToken(
			req.user
		)
		console.log('REQUEST----------------------------------------------')
		console.log('RESPONSE----------------------------------------------')
		this.authService.addRefreshTokenToResponse(res, refreshToken)
		const frontendUrl = this.configService.get<string>('FRONTEND_URL')

		console.log('github/callback')
		// Перенаправляем пользователя на фронтенд с токеном

		res.redirect(`${frontendUrl}/auth/success?accessToken=${accessToken}`)
	}

	// Подтверждение email
	@Get('verify-email')
	async verifyEmail(
		@Query('token') token: string,
		@Res({ passthrough: true }) res: Response
	) {
		await this.authService.verifyEmail(token)
		console.log('email verified')
		return { success: true, message: 'Email успешно подтвержден' }
	}

	// Повторная отправка email для подтверждения

	@Post('resend-verification')
	@UseGuards(AuthGuard('jwt'))
	async resendVerification(@CurrentUser() user: User) {
		return this.authService.resendVerificationEmail(user.id)
	}

	// Получение информации о текущем пользователе
	@Get('me')
	@UseGuards(AuthGuard('jwt'))
	getProfile(@CurrentUser() user: User) {
		return user
	}

	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshToken(res)
		return true
	}

	@Post('access-token')
	async getNewTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookie =
			req.cookies[this.authService.REFRESH_TOKEN_NAME]

		if (!refreshTokenFromCookie) {
			this.authService.removeRefreshToken(res)
			throw new UnauthorizedException('Refresh token not passed')
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookie
		)
		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}
}

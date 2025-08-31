import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'
import { AuthService } from '../auth.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
	constructor(
		private authService: AuthService,
		private configService: ConfigService
	) {
		super({
			clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
			clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
			callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
			scope: ['user:email']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any) {
		if (!profile.emails?.[0]?.value) {
			throw new UnauthorizedException('GitHub account without email')
		}

		const { login, bio, avatar_url } = profile._json
		const user = await this.authService.validateGithubUser({
			githubId: profile.id,
			email: profile.emails[0].value,
			name: login,
			bio: bio,
			avatarUrl: avatar_url
		})

		return user
	}
}

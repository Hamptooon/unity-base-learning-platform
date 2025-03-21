import { Module, forwardRef } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { GithubStrategy } from './strategies/github.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersModule } from '../user/user.module'
import { EmailModule } from '../email/email.module'
import { jwtConfig } from '@/config/jwt.config'

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: jwtConfig
		}),
		PrismaModule,
		forwardRef(() => UsersModule),
		EmailModule
	],
	controllers: [AuthController],
	providers: [AuthService, GithubStrategy, JwtStrategy],
	exports: [AuthService]
})
export class AuthModule {}

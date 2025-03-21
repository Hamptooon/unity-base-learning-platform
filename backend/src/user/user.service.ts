import {
	Injectable,
	NotFoundException,
	Inject,
	forwardRef
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Role, User } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { AuthService } from '@/auth/auth.service'
@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService
	) {}

	async findById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})
		if (!user) {
			throw new NotFoundException('Пользователь не найден')
		}
		return user
	}

	async findByGithubId(githubId: string) {
		const user = await this.prisma.user.findUnique({
			where: { githubId }
		})
		return user
	}

	async createGithubUser(
		githubUser: {
			githubId: string
			email: string
			name: string
			avatarUrl: string
			bio: string
		},
		verificationToken: string
	): Promise<User> {
		return this.prisma.user.create({
			data: {
				email: githubUser.email,
				name: githubUser.name,
				githubId: githubUser.githubId,
				avatarUrl: githubUser.avatarUrl,
				bio: githubUser.bio,
				emailVerificationToken: verificationToken,
				emailVerified: false,
				role: Role.USER
			}
		})
	}
	async updateUserInfo(
		id: string,
		data: { name: string; bio: string; email: string }
	) {
		const user = await this.prisma.user.findUnique({
			where: { id }
		})
		if (!user) {
			throw new NotFoundException('Пользователь не найден')
		}
		if (user.email !== data.email) {
			await this.authService.resendVerificationChangeEmail(id)
		}
		return this.prisma.user.update({
			where: { id },
			data
		})
	}
	// async updateRole(id: string, role: Role) {
	// 	return this.prisma.user.update({
	// 		where: { id },
	// 		data: { role }
	// 	})
	// }
}

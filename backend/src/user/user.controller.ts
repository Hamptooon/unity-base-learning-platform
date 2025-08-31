import {
	Controller,
	Get,
	Patch,
	Param,
	Body,
	UseGuards,
	Post
} from '@nestjs/common'
import { UsersService } from './user.service'
import { Roles } from '../auth/decorators/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AuthGuard } from '@nestjs/passport'
import { Role } from '@prisma/client'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard'
import { User } from '@prisma/client'
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
	constructor(private usersService: UsersService) {}

	// // Получение пользователя (требуется подтверждение email)
	// @Get(':id')
	// @UseGuards(EmailVerifiedGuard)
	// findOne(@Param('id') id: string) {
	// 	return this.usersService.findById(id)
	// }
	@Patch('me')
	@UseGuards(AuthGuard('jwt'))
	updateCurrentUserInfo(
		@CurrentUser() user: User,
		@Body() data: { name: string; bio: string; email: string }
	) {
		return this.usersService.updateUserInfo(user.id, data)
	}

	@Get(':id')
	getUserById(@Param('id') id: string) {
		return this.usersService.findById(id)
	}
	// Обновление роли (только для админов)
	// @Patch(':id/role')
	// @Roles(Role.ADMIN)
	// @UseGuards(RolesGuard)
	// updateRole(@Param('id') id: string, @Body() data: { role: Role }) {
	// 	return this.usersService.updateRole(id, data.role)
	// }
}

// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common'
import { UsersService } from './user.service'
import { UsersController } from './user.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from '@/auth/auth.module'

@Module({
	imports: [PrismaModule, forwardRef(() => AuthModule)],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService]
})
export class UsersModule {}

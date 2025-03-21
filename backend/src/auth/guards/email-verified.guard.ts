import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const { user } = context.switchToHttp().getRequest()
		return user.emailVerified === true
	}
}

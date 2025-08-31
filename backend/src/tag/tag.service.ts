import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TagService {
	constructor(private prisma: PrismaService) {}

	async getTags(name: string) {
		return this.prisma.tag.findMany({
			where: {
				name: {
					contains: name,
					mode: 'insensitive'
				}
			},
			take: 5,
			orderBy: {
				name: 'asc' // или используйте другое поле, если есть `popularity`, `createdAt` и т.д.
			}
		})
	}
}

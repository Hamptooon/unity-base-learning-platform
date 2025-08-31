import { Controller, Get, Query } from '@nestjs/common'
import { TagService } from './tag.service'

@Controller('tags')
export class TagController {
	constructor(private readonly tagService: TagService) {}

	@Get()
	async getTags(@Query('search') search?: string) {
		return this.tagService.getTags(search || '')
	}
}

import { Get, Param, Post, Body, Put, Delete, Query } from '@nestjs/common'
import { Controller } from '@nestjs/common'
import { AiService } from './ai.service'
import { TextCheckDto } from './dto/text-check.dto'
@Controller('ai')
export class AiController {
	constructor(private readonly aiService: AiService) {}

	@Post('checktext')
	async checkText(@Body() data: TextCheckDto) {
		return await this.aiService.analyzeComment(data)
	}
}

import { TagService } from './tag.service'
import { Module } from '@nestjs/common'
import { TagController } from './tag.controller'

@Module({
	controllers: [TagController],
	providers: [TagService]
})
export class TagModule {}

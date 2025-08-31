import { Module } from '@nestjs/common'
import { PractiseService } from './standalone-practise.service'
import { PractiseController } from './standalone-practise.controller'
@Module({
	controllers: [PractiseController],
	providers: [PractiseService]
})
export class PractiseModule {}

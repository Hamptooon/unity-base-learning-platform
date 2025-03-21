// files.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FilesService } from './files.service'

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('upload-image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadImage(@UploadedFile() file: Express.Multer.File) {
		console.log('---------')
		const fileUrl = await this.filesService.uploadImage(file)
		return fileUrl
	}

	@Post('upload-unity-package')
	@UseInterceptors(FileInterceptor('file'))
	async uploadUnityPackage(@UploadedFile() file: Express.Multer.File) {
		const fileUrl = await this.filesService.uploadUnityPackage(file)
		return fileUrl
	}
}

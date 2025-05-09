// files.controller.ts
import {
	Controller,
	Post,
	Get,
	UploadedFile,
	UseInterceptors,
	Res,
	Param
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FilesService } from './files.service'
import { Response } from 'express'
import { join } from 'path'
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

	@Get(':filename')
	downloadFile(@Param('filename') filename: string, @Res() res: Response) {
		const filePath = join(
			__dirname,
			'..',
			'..',
			'private-uploads/unity-packages',
			filename
		)
		console.log('filePath', filePath)
		res.download(filePath) // Отправка файла клиенту
	}
}

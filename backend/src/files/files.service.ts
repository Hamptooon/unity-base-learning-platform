// files.service.ts
import {
	Injectable,
	BadRequestException,
	InternalServerErrorException
} from '@nestjs/common'
import { extname } from 'path'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class FilesService {
	// Загрузка изображений
	async uploadImage(file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('Файл не был предоставлен')
		}
		const mainDirectory = 'uploads'
		const folder = 'images'
		// Проверка формата файла (если нужно)
		const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
		const fileExt = extname(file.originalname).toLowerCase()
		if (!allowedExtensions.includes(fileExt)) {
			throw new BadRequestException(
				`Неподдерживаемый формат файла. Допустимы только: ${allowedExtensions.join(', ')}`
			)
		}

		// Проверка размера файла (например, не более 5MB)
		const maxSize = 5 * 1024 * 1024 // 5MB
		if (file.size > maxSize) {
			throw new BadRequestException(
				`Файл слишком большой. Максимальный размер: 5MB`
			)
		}

		try {
			const resultFileName = await this.saveFile(file, mainDirectory, folder)
			return `/${mainDirectory}/${folder}/${resultFileName}`
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при сохранении файла: ' + error.message
			)
		}
	}

	// Загрузка Unity пакетов
	async uploadUnityPackage(file: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException('Файл не был предоставлен')
		}
		const mainDirectory = 'private-uploads'
		const folder = 'unity-packages'
		console.log('fileNAme', file.originalname)
		const allowedExtensions = ['.unitypackage']
		const fileExt = extname(file.originalname).toLowerCase()
		if (!allowedExtensions.includes(fileExt)) {
			throw new BadRequestException(
				`Неподдерживаемый формат файла. Допустимы только: ${allowedExtensions.join(', ')}`
			)
		}

		const maxSize = 500 * 1024 * 1024 // 50MB
		if (file.size > maxSize) {
			throw new BadRequestException(
				`Файл слишком большой. Максимальный размер: 500MB`
			)
		}

		try {
			const resultFileName = await this.saveFile(file, mainDirectory, folder)
			return `${resultFileName}`
		} catch (error) {
			throw new InternalServerErrorException(
				'Ошибка при сохранении файла: ' + error.message
			)
		}
	}

	// Общий метод сохранения файла
	private async saveFile(
		file: Express.Multer.File,
		mainDirectory: string,
		folder: string
	) {
		const uploadPath = path.join(process.cwd(), mainDirectory, folder)

		// Создаем директорию, если не существует
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true })
		}

		// Генерируем уникальное имя файла
		const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`
		const filePath = path.join(uploadPath, fileName)

		// Записываем файл
		fs.writeFileSync(filePath, file.buffer)

		// Возвращаем URL для доступа к файлу
		return `${fileName}`
	}
}

// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { join } from 'path'
import * as express from 'express'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	const config = app.get(ConfigService)
	app.use(cookieParser())

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true
		})
	)

	app.enableCors({
		origin: config.getOrThrow('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie']
	})
	app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))
	await app.listen(config.getOrThrow('PORT'))
	console.log(
		`Application is running on: http://localhost:${config.getOrThrow('PORT')}`
	)
}
bootstrap()

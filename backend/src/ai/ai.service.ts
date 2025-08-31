import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { TextCheckDto } from './dto/text-check.dto'
@Injectable()
export class AiService {
	constructor(private prisma: PrismaService) {}

	async analyzeComment(
		checkText: TextCheckDto
	): Promise<{ score: number; explanation: string }> {
		const response = await fetch(
			'https://api.intelligence.io.solutions/api/v1/chat/completions',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.IO_INTELLIGENCE_API_KEY}`
				},
				body: JSON.stringify({
					model: 'meta-llama/Llama-3.3-70B-Instruct',
					messages: [
						{
							role: 'system',
							content: `Ты модератор. Проанализируй комментарий отзыва на решение задания по Unity.

		Оцени его по шкале от 0 до 100, где:
		- 0 означает полностью адекватный, полезный и доброжелательный комментарий, конструктивный;
		- 100 — крайне токсичный, оскорбительный, разрушительный, бесполезный комментарий, без содержательной части.

		Особое внимание обрати на следующие моменты:
		- Комментарии, состоящие из одного или нескольких коротких слов без оценки и содержательного анализа (например, "отлично", "супер", "хорошо") должны получить высокую оценку (близкую к 100), как бесполезные.
		- Если комментарий не оценивает сам проект, не содержит конструктивной критики или похвалы, а содержит отвлечённые или не относящиеся к заданию темы — также высокий балл.
		- Комментарии с конструктивной обратной связью, критикой, оценкой различных аспектов проекта (код, дизайн, функционал) должны получить низкий балл.
		- Если всё хорошо — скажи об этом.

		Формат ответа:
		Число, потом дефис, потом краткое объяснение.
		Пример:
		65 - Комментарий содержит грубые выражения и субъективные обвинения.
		90 - Комментарий слишком короткий и не содержит конструктивной оценки.
		0 - Комментарий полезный, конструктивный и по теме.`
						},
						{
							role: 'user',
							content: checkText.comment
						}
					]
				})
			}
		)

		const data = await response.json()
		const content = data.choices?.[0]?.message?.content ?? '0 - Нет объяснения'

		console.log('Toxicity analysis result:', content)

		const match = content.match(/^(\d{1,3})\s*-\s*(.+)$/)
		if (match) {
			const score = Math.min(parseInt(match[1]), 100)
			const explanation = match[2].trim()
			return { score, explanation }
		}

		return { score: 0, explanation: 'Не удалось распознать ответ модели' }
	}
}

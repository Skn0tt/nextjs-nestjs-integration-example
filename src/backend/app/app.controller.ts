import { Controller, Get } from '@nestjs/common'

@Controller('randomNumber')
export class AppController {
	@Get()
	randomNumber() {
		return Math.ceil(Math.random() * 10000)
	}
}

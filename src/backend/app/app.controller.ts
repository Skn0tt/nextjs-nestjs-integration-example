import { Controller, Get } from "@nestjs/common";

@Controller("randomNumber")
export class AppController {

  @Get()
  randomNumber() {
    return Math.random() * 100;
  }
  
}
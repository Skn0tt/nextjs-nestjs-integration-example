import { Controller, Get, Param } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("/api/randomNumber")
  randomNumber() {
    return Math.random() * 100;
  }
}

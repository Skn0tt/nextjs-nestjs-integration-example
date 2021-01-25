import { Controller, Get, Param } from "@nestjs/common";

@Controller("randomNumber")
export class AppController {
  @Get()
  randomNumber() {
    return Math.random() * 100;
  }

  @Get("/:number")
  async findOne(@Param("number") param: string) {
    return { param }; // You don't even need a return, I put it just to have some return.
  }
}

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import * as http from "http";
import { NextApiHandler } from "next";

export module Backend {

  let listener: NextApiHandler | null = null;

  export async function getListener() {
    if (!listener) {
      const app = await NestFactory.create(
        AppModule
      );
      app.setGlobalPrefix("api");
  
      await app.init();
      
      const server: http.Server = app.getHttpServer();
      [ listener ] = server.listeners("request") as NextApiHandler[];
    }

    return listener;
  }
}

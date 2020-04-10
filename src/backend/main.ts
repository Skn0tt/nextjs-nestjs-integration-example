import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import * as http from "http";

function singleton<T, A extends any[]>(getter: (...args: A) => Promise<T>) {
  let instance: T | null = null;
  return async function(...args: A) {
    if (!instance) {
      instance = await getter(...args);
    }

    return instance;
  }
}

export module Backend {
  export const getListener = singleton(async () => {
    const app = await NestFactory.create(
      AppModule
    );
    app.setGlobalPrefix("api");
    await app.init();
    
    const server: http.Server = app.getHttpServer();
    const [ listener ] = server.listeners("request");
    return listener;
  });
}
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import * as http from "http";
import { NextApiHandler } from "next";
import { INestApplication } from "@nestjs/common";

export module Backend {
  export async function getApp(): Promise<INestApplication> {
    if (globalThis.app) {
      return globalThis.app;
    }
  
    if (!globalThis.appPromise) {
      globalThis.appPromise = new Promise<void>(async (resolve) => {
        const appInCreation = await NestFactory.create(AppModule, {
          bodyParser: false
        });
        await appInCreation.init();
        globalThis.app = appInCreation;
        globalThis.app.setGlobalPrefix("api/graphql",  {
          exclude: ["/api/randomNumber"]
        });
        resolve();
      });
    }

    await globalThis.appPromise;
    return globalThis.app;
  }

  export async function getListener() {
    const app = await getApp();
    const server: http.Server = app.getHttpServer();
    const [ listener ] = server.listeners("request") as NextApiHandler[];
    return listener;
  }
}

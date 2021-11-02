import { Module } from "@nestjs/common";
import { GraphQLModule } from '@nestjs/graphql';
import { AppResolver } from './app.resolver';
import { AppController } from "./app.controller";

@Module({
  imports: [
    GraphQLModule.forRoot({
      path: '/api/graphql',
      useGlobalPrefix: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: true,
      bodyParserConfig: false,
      cors: false,
      introspection: true,
      playground: true, // must be `false` when using in production
    }),
  ],
  providers: [AppResolver],
  controllers: [AppController]
})
export class AppModule {}
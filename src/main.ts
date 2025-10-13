import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

/**
 * NestJS 应用引导函数，用于创建和配置 Express 应用
 */
async function bootstrap() {
  // 创建 NestJS 应用实例，指定为 Express 应用类型
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //配置cookie中间件
  app.use(cookieParser('set signed cookies'));

  //配置session的中间件
  app.use(
    session({
      secret: 'keyboard cat',
      resave: true,
      saveUninitialized: true,
      cookie: { maxAge: 219000, httpOnly: true },
      rolling: true,
    }),
  );

  await app.listen(5173);
}
bootstrap();

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

  app.enableCors({
    origin: true, // 或指定前端的地址 'http://localhost:5173', 不能用通配符*
    credentials: true // 允许凭证
  });

  //配置cookie中间件
  app.use(cookieParser('set signed cookies'));

  //配置session的中间件
  app.use(
    session({
      secret: 'keyboard cat', // 用于签名session ID的cookie
      resave: true,
      saveUninitialized: true,
      cookie: { 
        secure: false,  // 生产环境如果用https设为true
        httpOnly: true,  // 防止XSS攻击
        /**
         * 当Cookie设置httpOnly为true时，这个Cookie将无法通过JavaScript的document.cookie属性访问，只能通过HTTP协议传输3。这对防止XSS攻击非常有效，因为：
              XSS攻击通常是通过注入恶意脚本到网页中执行，这些脚本可以尝试读取当前页面的所有Cookie
              如果Cookie设置了httpOnly标志，即使存在XSS漏洞，攻击者的脚本也无法读取这些受保护的Cookie
              这特别有助于保护会话Cookie和身份验证令牌，防止它们被恶意脚本窃取
         */
        maxAge: 24 * 60 * 60 * 1000,  // 24小时
        sameSite: 'lax'  // CSRF保护
        /**
         * SameSite属性控制Cookie是否在跨站请求中发送，当设置为'lax'时：

            1.在大多数跨站请求中，浏览器不会发送Cookie，这阻止了CSRF攻击的主要媒介
            2.但对于某些导航操作(如从外部网站链接进入)，浏览器仍会发送Cookie，提供了更好的用户体验
            3.具体来说，Lax模式允许GET请求携带Cookie，但阻止大多数POST等状态改变请求携带Cookie
            这种设置有效防止CSRF攻击，因为攻击者无法从他们的恶意网站向目标网站发起带有认证Cookie的请求3。
         */
      },
      rolling: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();

import { Injectable, NestMiddleware } from '@nestjs/common';
import * as url from 'url';

@Injectable()
export class AdminauthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const pathname = req.baseUrl;
    console.log('Request URL pathname:', pathname);
    if (pathname === '/admin/login' || pathname === '/admin/login/code' || pathname === '/admin/login/testdb') {
      return next();
    }
    if (!req.session.userinfo) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    next();
  }
}

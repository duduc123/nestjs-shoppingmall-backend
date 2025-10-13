import { Injectable, NestMiddleware } from '@nestjs/common';
import * as url from 'url';

@Injectable()
export class AdminauthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const pathname = url.parse(req.url).pathname;
    if (pathname === '/admin/login' || pathname === '/admin/login/code') {
      return next();
    }
    if (!req.session.adminuser) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { AdminService } from '@/service/admin/admin.service';
import * as url from 'url';

@Injectable()
export class AdminauthMiddleware implements NestMiddleware {
  constructor(private readonly adminService: AdminService) {}
  async use(req: any, res: any, next: () => void) {
    const pathname = req.baseUrl;
    console.log('Request URL pathname:', pathname);
    if (pathname === '/admin/login' || pathname === '/admin/login/code' || pathname === '/admin/login/testdb' || pathname === '/admin/login/doLogin') {
      return next();
    }
    if (!req.session.userinfo) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const userinfo = req.session.userinfo;
    console.log('userinfo:', userinfo);
    /**
     * 1. 判断当前用户是否是超级管理员 is_super = 1
     * 2. 根据角色获得当前角色的权限列表
     * 3. 获取当前用户的url 对应的权限 id
     * 4. 判断当前 访问的URL 对应的权限id是否在权限列表中的id
     * 逻辑放在 adminService中判断权限
     */
    /**
     * 在中间件中使用 adminserivce 需要配置：
     * 1. 在 admin.module.ts 中 暴漏 exports[AdminService, RoleService, RoleAccessService...] 
     * 2. 在 app.module.ts 中 引入 AdminModule, imports:[AdminModule]
     */
    if (this.adminService.checkAuth(req)) {
      return next();
    } else {
      return res.status(403).send({ message: 'Forbidden' });
    }
  }
}

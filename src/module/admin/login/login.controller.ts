import { Controller, Get, Post, Response, Request } from '@nestjs/common';
import { ToolsService } from '../../../service/tools/tools.service';
import { AdminService } from 'src/service/admin/admin.service';

@Controller('admin/login')
export class LoginController {
  constructor(private toolsService: ToolsService, private adminService: AdminService) {}
  @Get()
  index() {
    return 'this is admin login get API';
  }

  @Get('code')
  async getCode(@Request() req, @Response() res) {
    const captcha = await this.toolsService.generateCaptcha();
    req.session.captcha = captcha.text; // Store the captcha text in session
    res.type('image/svg+xml');
    res.status(200).send(captcha.data);
  }

  @Post('doLogin')
  async doLogin(@Request() req, @Response() res) {
    try {
      const { username, password, captcha } = req.body;
      if (captcha != req.session.captcha) {
        res.send({ code: 400, msg: '验证码不正确' });
      } else {
        const user = await this.adminService.find({ username });
        if (!user) {
          res.send({ code: 400, msg: '用户不存在' });
        } else {
          if (user.password != password) {
            res.send({ code: 400, msg: '密码不正确' });
          } else {
            req.session.userinfo = user;
            res.send({ code: 200, msg: '登录成功' });
          }
        }
      }
    } catch (err) {
      res.send({ code: 500, msg: '服务器错误' });
    }
  }

  @Get('loginOut')
  async loginOut(@Request() req, @Response() res) {
    req.session.userinfo = null;
    res.redirect('/admin/login');
  }

  @Get('testdb')
  async testdb(@Request() req, @Response() res) {
    const alluser = await this.adminService.find();
    res.send(alluser);
  }
}

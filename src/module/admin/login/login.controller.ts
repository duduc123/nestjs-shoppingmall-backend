import { Controller, Get, Post, Response, Request } from '@nestjs/common';
import { ToolsService } from '../../../service/tools/tools.service';
import { AdminService } from '../../../service/admin/admin.service';

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
      // console.log('req.session:', req.session);
      if (captcha.toUpperCase() != req.session.captcha.toUpperCase()) {
        res.send({ code: 400, msg: '验证码不正确' });
      } else {
        const passwordHash = this.toolsService.getMd5(password);
        // console.log('passwordHash:  ', passwordHash);
        const userResult = await this.adminService.find({ "username": username, "password": passwordHash });
        if (userResult.length > 0) {
          console.log('登录成功');
          req.session.userinfo=userResult[0];
          res.send({ code: 200, msg: '登录成功', user: userResult[0], token: req.session });
        } else {
          console.log('用户名或者密码不正确');
          res.send({ code: 400, msg: '用户名或者密码不正确' });
        }
      }
    } catch (err) {
      console.error('Error during login:', err);
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

  @Get('testsession')
  async testsession(@Request() req, @Response() res) {
    res.send(req.session);
  }
}

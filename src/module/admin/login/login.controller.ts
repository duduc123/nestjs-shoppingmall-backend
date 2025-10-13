import { Controller, Get, Response, Request } from '@nestjs/common';
import { ToolsService } from '../../../service/tools/tools.service';

@Controller('admin/login')
export class LoginController {
  constructor(private toolsService: ToolsService) {}
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
}

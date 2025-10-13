import { Controller, Get, Render } from '@nestjs/common';

@Controller('admin/login')
export class LoginController {
  @Get()
  index() {
    return 'this is admin login get API';
  }
}

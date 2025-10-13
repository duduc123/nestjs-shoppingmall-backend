import { Controller, Get, Render } from '@nestjs/common';

@Controller('admin')
export class MainController {
  @Get()
  index() {
    return 'this isadmin/main/index  get API';
  }
}

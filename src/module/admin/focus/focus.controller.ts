import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Response } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // 如果是多个文件上传则是 FilesInterceptor
import { createWriteStream } from 'fs';
import { join } from 'path';
import { ToolsService } from '../../../service/tools/tools.service';
import { FocusService } from '@/service/focus/focus.service';
@Controller('focus')
export class FocusController {
  constructor(private readonly toolsService: ToolsService, private readonly focusService: FocusService) {}

  @Get()
  async index() {
    const result = await this.focusService.find();
    return { message: 'Focus index', data: result };
  }

  @Get('add')
  add() {
    return { message: 'Focus add' };
  }

  /**
   * 1. 单文件上传封装到/service/tools.service 模块中
   * 2. 按照日期来存储图片
   */
  @Post('doAdd')
  @UseInterceptors(FileInterceptor('focus_img')) // 接受的字段名是 focus_img
  async doAdd(@Body() body, @UploadedFile() file) {
    try {
      // 以前的写法，直接在控制器中实现
      // const writeImage = createWriteStream(join(__dirname, '../../../../public/uploads/' + file.originalname));
      // writeImage.write(file.buffer); // 将文件写入到指定目录
      // return { message: 'Focus doAdd', data: body };
      
      // 封装到/service/tools.service 模块中
      if (file) {
        const savePath = this.toolsService.uploadFile(file);
        await this.focusService.add({ ...body, focus_img: savePath, add_time: Date.now() });
        return { message: 'upload success', data: savePath };
      } else { 
        await this.focusService.add({ ...body, focus_img: '', add_time: Date.now() });
        return { message: 'upload success without file', data: '' };
      }
    } catch (error) {
      return { message: 'upload failed', error };
    }
  }

  @Post('doEdit')
  @UseInterceptors(FileInterceptor('focus_img'))
  async doEdit(@Body() body, @UploadedFile() file) {
    if (file) {
      // 如果有上传文件，则更新图片
      const savePath = this.toolsService.uploadFile(file);
      const result = await this.focusService.update({ _id: body._id }, { ...body, focus_img: savePath });
      return { message: 'Focus doEdit', data: result };
    } else {
      // 如果没有上传文件，则不更新图片
      const result = await this.focusService.update({ _id: body._id }, body);
      return { message: 'Focus doEdit', data: result };
    }
  }

  @Get('delete')
  async delete(@Body() body) {
    const result = await this.focusService.delete({ _id: body._id });
    return { message: 'Focus delete', data: result };
  }
}
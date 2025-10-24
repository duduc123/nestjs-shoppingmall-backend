import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import * as md5 from 'md5';

import { format } from 'silly-datetime';
import { join, extname } from 'path';
import * as mkdirp from 'mkdirp';
import { createWriteStream } from 'fs';

// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ToolsService {
  async generateCaptcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      background: '#cc9966',
    });
    return captcha;
  }
  getMd5(str: string) {
    return md5(str);
  }

  async getUUID() {
    const { v4: uuidv4 } = await import('uuid');
    const uuid = await uuidv4();
    return uuid;
  }

  getTime() {
    return new Date().getTime();
  }

  /**
   * 1.获得当前日期
   * 2.根据日期创建目录
   * 3.实现上传
   * 4.返回图片保存的地址
   */
  uploadFile(file) {
    const date = format(new Date(), 'YYYY-MM-DD'); // 用于创建目录
    const timesnap = this.getTime(); // 用于生成文件名
    const dir = join(__dirname, '../../public/uploads/' + date + '/');
    mkdirp.sync(dir); // 创建目录, sync 改成同步
    const uploadDir = join(dir, timesnap + extname(file.originalname)); // 上传地址
    
    const writeImage = createWriteStream(uploadDir); // 实现上传
    writeImage.write(file.buffer); // 将文件写入到指定目录
    
    const imageUrl = join('/uploads/' + date + '/' + timesnap + extname(file.originalname)); // 返回图片保存的地址
    return imageUrl;
  }
}

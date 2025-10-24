import { Controller, Get, Post, Body, Param, Query, Put, Delete } from '@nestjs/common';
import { AccessService } from '../../../service/access/access.service';
import * as mongoose from 'mongoose';

@Controller('access')
export class AccessController {
  constructor(private accessService: AccessService){}

  @Get()
  async index() {
    //1、在access表中找出  module_id=0的数据 
    //2、让access表和access表关联    条件：找出access表中module_id等于_id的数据
    // 可能的改进: 考虑添加索引以提高查询性能, 可以考虑分页处理大量数据的情况
    // 在 module_id 字段上创建索引 db.access.createIndex({ module_id: 1 })
    // 创建复合索引，同时支持 module_id 和 _id 的查询 db.access.createIndex({ module_id: 1, _id: 1 })
    const result = await this.accessService.getModel().aggregate([
      {
        $lookup: {
          from: 'access',// 要关联的集合名称
          localField: '_id',// 当前集合的关联字段
          foreignField: 'module_id',// 目标集合的关联字段
          as: 'items'// 关联结果存储的字段名
        }
      },
      {
        $match: { module_id: '0' }
      }
    ])

    return { list: result };
  }

  @Post('doAdd')
  async doAdd(@Body() body) {
    // Normalize module_id: convert to ObjectId if it's a valid ObjectId string,
    // otherwise keep as-is (string or number). Default to '0' when missing.
    const result = await this.accessService.add(body);
    console.log('添加成功 result:', result);
    return { code: 200, message: '添加成功', data: result};
  }

  @Put('edit/:id')
  async edit(@Param('id') id: string, @Body() body) {
    try{
      const result = await this.accessService.update({ _id: id }, body);
      console.log('修改body:', body);
      console.log('修改成功 result:', result);
      const moduleList = await this.accessService.findOne({ "_id": id });
      return { moduleList };
    } catch (error) {
      console.error('修改失败:', error);
      return { code: 500, message: '修改失败', error };
    }
  }

  @Get('edit/:id')
  async getEdit(@Param('id') id: string) {
    const moduleList = await this.accessService.getModel().aggregate([
      {
        $match: { _id: id }
      }
    ]);
    //  moduleList = await this.accessService.findOne({ _id: id });
    return { moduleList };
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    try {
      const result =  await this.accessService.delete({ _id: id });
      console.log('删除结果 result:', result);
      const moduleList = await this.accessService.find();
      return { moduleList };
    } catch (error) {
      console.error('删除失败:', error);
      return { code: 500, message: '删除失败', error };
    }
  }

  @Get('allList')
  async getAllList() {
    const moduleList = await this.accessService.find();
    return { moduleList };
  }
}
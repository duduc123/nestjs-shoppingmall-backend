import { Controller, Get, Render, Post, Body, Response, Query  } from '@nestjs/common';
import { AdminService } from './../../../service/admin/admin.service';
import { RoleService } from 'src/service/role/role.service';
import { ToolsService } from './../../../service/tools/tools.service';
import mongoose from 'mongoose';

@Controller('/manager')
export class ManagerController {

  constructor(private adminService: AdminService, private toolsService: ToolsService) { }
  @Get()
  async index() {
    // 获取管理员列表以及role表关联的数据
    // const result = await this.adminService.getModel().aggregate([
    //   {
    //     $lookup: {
    //       from: 'role',
    //       localField: 'role_id',
    //       foreignField: '_id',
    //       as: 'role'
    //     }
    //   }]); // 上面的聚合无法查到关联的role, 原因是：  role 表中的 _id 是 ObjectId 类型，需要转换成字符串类型
    const result = await this.adminService.getModel().aggregate([
      {
        $lookup: {
          from: 'role',
          let: { roleIdStr: "$role_id"}, // 将 role_id 字段的值赋给变量 roleIdStr
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$roleIdStr" }] // 将变量 roleIdStr 转换为 ObjectId 类型进行比较
                }
              }
            }
          ],
          as: 'role'
        }
      }
    ]);
    /**
     * 这样修改的原因是：
     * 1.使用 let 将 admin 表中的 role_id 字段的值赋给变量 roleIdStr。并且传递给子管道
     * 2.在子管道中自定义关联逻辑
     * 3.使$toObjectId将字符串的的role_id 转换为ObjectId
     * 4.使用expr 和 eq进行类型匹配后的比较
     */
    return { adminResult: result };
  }

  @Post('doAdd')
  async doAdd(@Body() body, @Response() res) {
    if (body.username == '' || body.password == '') {
      res.send({ code: 400, msg: '用户名或者密码不能为空' });
      return;
    } else {
      const existingAdmins = await this.adminService.find({ username: body.username });
      if (existingAdmins.length > 0) {
        res.send({ code: 400, msg: '用户名已存在，请选择其他用户名' });
        return;
      }
    }
    const admin = await this.adminService.add(body);
    res.send(admin);
  }
  
  @Post('doEdit')
  async doEdit(@Body() body, @Response() res) {
    const id = body._id;
    const admin = await this.adminService.update({ _id: id }, body);
    res.send(admin);
  }

  @Get('doDelete')
  async doDelete(@Query() query, @Response() res) {
    const id = query.id;
    const admin = await this.adminService.delete({ _id: id });
    res.send(admin);
  }
}

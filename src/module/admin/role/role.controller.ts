import { Controller, Get, Post, Response, Request, Put, Delete, Query, Body, Param } from '@nestjs/common';
import { RoleService } from '../../../service/role/role.service';
import { RoleAccessService } from '../../../service/role-access/role-access.service';
import { AccessService } from '../../../service/access/access.service';
import mongoose from 'mongoose';

@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService, private roleAccessService: RoleAccessService, private accessService: AccessService) { }
  @Get()
  index() {
    return this.roleService.find();
  }


  @Get('findone/:id')
  async findOne(@Request() req, @Response() res) {
    const id = req.params.id;
    const role = await this.roleService.findOne({ _id: id });
    res.send(role);
  }

  @Post('add')
  async doAdd(@Query() body, @Response() res) {
    const role = await this.roleService.add(body);
    res.send(role);
  }

  @Put('edit/:id')
  async update(@Request() req, @Response() res) {
    const id = req.params.id;
    const role = await this.roleService.update({ _id: id }, req.body);
    res.send(role);
  }

  @Delete('delete/:id')
  async delete(@Request() req, @Response() res) {
    const id = req.params.id;
    const role = await this.roleService.delete({ _id: id });
    res.send(role);
  }

  @Get('auth/:id')
  async auth(@Param('id') roleId, @Response() res) {
    const role_id = roleId;
    //1、获取全部的权限
    const result = await this.accessService.getModel().aggregate([
      {
        $lookup: {
          from: 'access',
          localField: '_id',
          foreignField: 'module_id',
          as: 'items'
        }
      },
      {
        $match: { 'module_id': '0' }
      }
    ]);
    // 2、查询当前角色拥有的权限（查询当前角色的权限id） 把查找到的数据放在数组中
     // 数据库中role_id存的是string 类型， 则schema 中定义类型也要是String，查询时也用string类型
     // 数据库中是 string  类型，则 schema 中定义类型也要是 String, 查询时也用 string 类型
    const accessResult = await this.roleAccessService.find({"role_id": roleId}); 

    const roleAccessArray = [];
    accessResult.forEach(value => {
        roleAccessArray.push(value.access_id.toString());
    });


    // 3、循环遍历所有的权限数据，判断当前权限是否在角色权限的数组中,如果是的话给当前数据加入checked属性

    for(let i=0;i<result.length;i++){

        if(roleAccessArray.indexOf(result[i]._id.toString())!=-1){
            result[i].checked=true;
        }


        for(let j=0;j<result[i].items.length;j++){

            if(roleAccessArray.indexOf(result[i].items[j]._id.toString())!=-1){
                result[i].items[j].checked=true;
            }
        }
    }
    res.send({
          list:result,
          role_id:role_id
      });
  }

  @Post('doAuth')
  async doAuth(@Body() body, @Response() res) {
    const roleId = body.roleId;
    const accessArr = body.accessIds;
    // 1.、先清除当前角色的所有权限
    await this.roleAccessService.deleteMany({ role_id: roleId });
    // 2、把当前角色对应的所有权限添加到 role_access 表中
    for (let i = 0; i < accessArr.length; i++) {
      await this.roleAccessService.add({ role_id: roleId, access_id: accessArr[i] });
    }
    res.send(true);
  }
}

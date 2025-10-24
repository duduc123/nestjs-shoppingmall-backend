import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AdminInterface } from '../../interface/admin.interface';
import { RoleAccessService } from '../role-access/role-access.service';
import { AccessService } from './../access/access.service';

@Injectable()
export class AdminService {
  constructor(
		@InjectModel('Admin') private readonly adminModel,
		private readonly roleAccessService: RoleAccessService,
		private readonly accessService: AccessService
	) {}
    async find(json: AdminInterface = {}, fields?: string) {
        try {
            return await this.adminModel.find(json, fields);
        } catch (error) {
            return [];
        }       
    }

    async add(json:AdminInterface){
        try {
            const admin = new this.adminModel(json);
            const result = await admin.save();
            return result;
        } catch (error) {
            return null;
        }
    }

    async update(json1:AdminInterface,json2:AdminInterface){
        try {
            const result = await this.adminModel.updateOne(json1,json2);          
            return result;
        } catch (error) {
            return null;
        }
    }

    async delete(json:AdminInterface){
        try {
            const result = await this.adminModel.deleteOne(json);          
            return result;
        } catch (error) {
            return null;
        }
    }

    /**
     * 1. 判断当前用户是否是超级管理员 is_super = 1
     * 2. 根据角色获得当前角色的权限列表
     * 3. 获取当前用户的url 对应的权限 id
     * 4. 判断当前 访问的URL 对应的权限id是否在权限列表中的id
     * 逻辑放在 adminService中判断权限
     */

    async checkAuth(req) {
        const pathname = req.baseUrl;
        const userinfo = req.session.userinfo;
        if (userinfo.is_super === 1) {
          return true; // 超级管理员拥有所有权限
        } else {
            // 2. 根据角色获得当前角色的权限列表
          const roleAccessList = await this.roleAccessService.find({ role_id: userinfo.role_id });
					console.log('roleAccessList:', roleAccessList);
					console.log('pathname:', pathname);
					// 3. 获取当前用户的url 对应的权限 id
					const accessResult = await this.accessService.find({ url: pathname });
					console.log('accessResult:', accessResult);
          if ( roleAccessList.length > 0 && accessResult.length > 0 ) {
            const accessId = accessResult[0]._id;
            if (roleAccessList.some(item => item.access_id === accessId)) {
              return true;
            }
          }
        }
        return false;
    }

    getModel(){
       return this.adminModel;
    }

}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RoleInterface } from '@/interface/role.interface';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel('Role') private readonly roleModel,
  ) {}

  async find(json:RoleInterface = {}, fields?: string) {
    try {
      return await this.roleModel.find(json, fields);
    } catch (error) {
      return [];
    }
  }

  async findOne(json:RoleInterface = {}, fields?: string) {
    try {
      return await this.roleModel.findOne(json, fields);
    } catch (error) {
      return null;
    }
  }

  async add(json = {}) {
    const role = new this.roleModel(json);
    return await role.save();
  }

  async update(json = {}, updateJson = {}) {
    return await this.roleModel.updateOne(json, updateJson);
  }

  async delete(json = {}) {
    return await this.roleModel.deleteOne(json);
  }

  getModel() {
    return this.roleModel;
  } 
}

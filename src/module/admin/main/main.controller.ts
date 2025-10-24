import { Controller, Get, Request } from '@nestjs/common';
import { AccessService } from './../../../service/access/access.service';
import { RoleAccessService } from './../../../service/role-access/role-access.service';

@Controller('main')
export class MainController {
  constructor(
    private accessService: AccessService, 
    private roleAccessService: RoleAccessService
  ) {}

  /**
   * 
   * @returns 返回当前用户的角色所拥有的权限（标志为， 其他）
   */
  @Get()
  async index(@Request() req) {
    // 1、获取全部的权限
    // 2、查询当前角色拥有的权限（查询当前角色的权限id） 把查找到的数据放在数组中
    // 3、循环遍历所有的权限数据，判断当前权限是否在角色权限的数组中,如果是的话给当前数据加入checked属性
    const userinfo = req.session.userinfo;
    console.log('userinfo in main index:', userinfo);
    const role_id = userinfo.role_id;
    const allAccessList = await this.accessService.getModel().aggregate([
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
    console.log('allAccessList:', allAccessList);
    const accessList = await this.roleAccessService.find({ role_id: role_id });
    const accessIds = new Set(accessList.map(item => item.access_id)); 
    // 使用 Set 替代数组来优化查找性能有以下具体好处：
    // 1.数组使用 includes() 方法的时间复杂度是 O(n)，需要遍历整个数组, Set 使用 has() 方法的时间复杂度是 O(1)，通过哈希表实现，无需遍历
    // 2.Set 会自动去重，如果 accessList 中有重复的 access_id，会自动去除
    
    // for (let i = 0; i < allAccessList.length; i++) {
    //   if (accessIds.has(allAccessList[i]._id)) {
    //     allAccessList[i]['checked'] = true;
    //   }
    //   for (let j = 0; j < allAccessList[i].items.length; j++) {
    //     if (accessIds.has(allAccessList[i].items[j]._id)) {
    //       allAccessList[i].items[j]['checked'] = true;
    //     }
    //   }
    // }
    // return { asideList: allAccessList};

    // 原来是使用两层for循环，现在改成 使用 map 替代嵌套循环，代码更简洁， 
    // 使用对象展开运算符（...）创建新对象，避免直接修改原数据
    const processedList = allAccessList.map( module => ({
      ...module,
      checked: accessIds.has(module._id.toString()),
      items: module.items.map( item => ({
        ...item,
        checked: accessIds.has(item._id.toString())
      })),
    }))
    return { asideList: processedList };
  }
}

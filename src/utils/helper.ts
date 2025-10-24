import { format } from 'silly-datetime';

export class helper {
  /**
   * 格式化时间
   * @param date 时间
   * @param formatStr 格式化字符串
   */
  static formatTime(params) {
    return format(params, 'YYYY-MM-DD HH:mm:ss');
  }
}
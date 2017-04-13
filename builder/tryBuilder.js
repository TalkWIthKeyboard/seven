/**
 * Created by CoderSong on 17/4/13.
 */

let pub = {};

/**
 * try-catch再封装构造器
 * @param cb 检测函数
 * @param value 检测值
 * @returns {boolean}
 */
pub.tryBuilder = (cb, value) => {
  try {
    value ? cb(value) : cb();
  } catch (err) {
    return false;
  }
  return true;
};


module.exports = pub;

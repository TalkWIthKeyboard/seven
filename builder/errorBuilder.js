/**
 * Created by CoderSong on 17/4/12.
 */

let pub = {};

/**
 * 错误构造器
 * @param anno 错误注解
 * @param info 错误信息
 */
pub.errorBuilder = (anno, info) => {
  return info
    ? {'annotation': anno, 'information': info}
    : {'annotation': anno};
};

module.exports = pub;

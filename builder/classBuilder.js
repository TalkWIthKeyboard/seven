/**
 * Created by CoderSong on 17/4/12.
 */

let pub = {};

/**
 * 类构造器
 * @param className 类名称
 * @param classObj 类中对象
 * @param rulesObj 规则对象
 * @returns {*}
 */
pub.classBuilder = (className, classObj, rulesObj) => {
  return rulesObj
    ? {'className': className, 'classObj': classObj, 'rulesObj': rulesObj}
    : {'className': className, 'classObj': classObj};
};

module.exports = pub;

/**
 * Created by CoderSong on 17/4/13.
 */

let pub = {};
let _ = require('underscore');

// mongoDB实体类单独字符串属性数据类型
pub.mongoStringAtr = ['String', 'Number', 'Boolean', 'Buffer', 'Date', 'ObjectId', 'Mixed'];
// mongoDB实体类数组属性首位数据类型
pub.mongoArrayAtr = ['Array', 'Date', 'ObjectId'];
// mongodb实体类数组属性规则
pub.mongoArrayRule = {
  'Array': _.isArray,
  'Date': _.isString,
  'ObjectId': _.isString
};
module.exports = pub;

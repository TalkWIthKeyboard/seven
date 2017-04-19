/**
 * Created by CoderSong on 17/4/19.
 */

let pub = {};
let responseBuilder = require('./factory/builderFactory').responseBuilder;

/**
 * 错误处理中间件
 * @returns {function(*=, *, *=, *)}
 */
pub.errorHandler = () => {
  return (err, req, res, next) => {
    let _err = new Error(err.msg);
    _err.status = err.status;
    responseBuilder.resErrorBuilder(res, _err);
    next();
  }
};

module.exports = pub;
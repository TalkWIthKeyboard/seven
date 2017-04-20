/**
 * Created by CoderSong on 17/4/20.
 */

let pub = {};
let path = require('path');
let _ = require('underscore');
let schemaConf = require('./factory/confFactory').schemaGeneralConf;

/**
 * 权限处理中间件
 * @returns {function(*, *=, *)}
 */
pub.authorityFilter = () => {
  return (req, res, next) => {
    // 用户的登录API不受任何限制
    if (req.originalUrl === '/login') next();
    else {
      // 开始进行权限判断
      let filterObj = require(path.join(__dirname, '..', '..', '.seven.json')).authority.filter;
      // 用户的角色
      let _role = req.session.role || false;
      let paramsList = req.originalUrl.split('/');
      // url对应的schema名字
      let schemaName = paramsList[1];
      // url对应的请求方法类型
      let type = req.method !== 'GET'
        ? schemaConf.urlMapping[req.method]
        : paramsList[2] === 'page'
          ? schemaConf.urlMapping.GET[0]
          : schemaConf.urlMapping.GET[1];
      // 该url对应的授权角色
      let roles = filterObj[schemaName][type] || false;

      (! roles || (_role && _.indexOf(roles, _role) > - 1))
        ? next()
        : next({
          status: 400,
          msg: 'You don`t have authority!'
        });
    }
  };
};


module.exports = pub;

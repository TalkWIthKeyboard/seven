/**
 * Created by CoderSong on 17/4/16.
 * schema到mongo的连接器
 */

let pub = {};
let Mongoose = require('mongoose');
let path = require('path');
let Conf = require('./factory/confFactory');
let _ = require('underscore');
let format = require('string-format');
let fs = require('fs');
let Builder = require('./factory/builderFactory');


/**
 * model构建器
 * @param schemaPath 传入schema集中的文件夹
 * @param scb
 * @param fcb
 */
pub.modelCreator = (schemaPath, scb, fcb) => {
  let _path = path.join(__dirname, '..', 'schema');
  let fileList;
  try {
    fileList = fs.readdirSync(_path);
  } catch (err) {
    fcb(Builder.errorBuilder('文件路径不存在', err));
  }

  let modelObj = {};
  if (fileList.length > 0) {
    _.each(fileList, (file) => {
      if (file.split('.')[1] == 'js') {
        let name = file.split('.')[0];
        let _schema = require(path.join(__dirname, '..', 'schema', name));
        // 添加通用属性
        _schema.add(Conf.schemaGeneralConf.globalAtr);
        // 添加初始化中间件
        _schema.pre = Conf.schemaGeneralConf.hooksOp.pre;
        // 添加初始化方法
        _schema.statics = Conf.schemaGeneralConf.staticsOp;
        modelObj[name] = Mongoose.model(name, _schema);
      }
    })
  }
  scb(modelObj);
};

/**
 * API构建器
 * @param modelObj
 * @param req
 * @param res
 * @param next
 * @param scb
 * @param fcb
 */
pub.apiCreator = (modelObj, req, res, next, scb, fcb) => {
  let apiObj = {};
  let apiMap = Conf.schemaGeneralConf.apiMapping;
  if (modelObj.length === 0) return fcb();
  _.mapObject(modelObj, (value, key) => {
    apiObj[key] = {};
    let _statics = value.schema.statics;
    // TODO 这边想一下代码能优化不
    // 分页API
    let _api = apiMap.Pagination;
    let _staticsKey = _.keys(_statics);
    console.log(_.difference(_staticsKey, _api.needs));
    if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
      apiObj[key][key + _api.name] = {func: _api.func(req, res, value, ['page'], next), type: _api.name};
    }
    // 创建API
    _api = apiMap.Create;
    if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
      apiObj[key][key + _api.name] = {func: _api.func(req, res, value, null, null, next), type: _api.name};
    }
    // 删除API
    _api = apiMap.Delete;
    if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
      apiObj[key][key + _api.name] = {func: _api.func(req, res, value, ['id'], next), type: _api.name};
    }
    // 更新API
    _api = apiMap.Update;
    if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
      apiObj[key][key + _api.name] = {func: _api.func(req, res, value, ['id'], null, next), type: _api.name};
    }
    // 查找API
    _api = apiMap.Get;
    if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
      apiObj[key][key + _api.name] = {func: _api.func(req, res, value, ['id'], next), type: _api.name};
    }
  });
  scb(apiObj);
};


/**
 * URL构建器
 * @param apiObj model对象数组
 * @param scb
 * @param fcb
 */
pub.restfulUrlCreator = (apiObj, scb, fcb) => {
  let urlObj = {};
  let _api = Conf.schemaGeneralConf.apiMapping;
  if (apiObj.length === 0) return fcb();
  _.mapObject(apiObj, (value, key) => {
    urlObj[key] = {};
    _.mapObject(value, (_value, _key) => {
      let _type = _value.type;
      urlObj[key][_key] = {
        url: format(_api[_type].url, key),
        type: _api[_type].type,
        func: _value.func
      };
    })
  });
  scb(urlObj);
};

module.exports = pub;

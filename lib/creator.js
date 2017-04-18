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
 */
pub.modelCreator = (schemaPath) => {
  let fileList = fs.readdirSync(schemaPath);

  let modelObj = {};
  if (fileList.length > 0) {
    _.each(fileList, (file) => {
      if (file.split('.')[1] == 'js') {
        let name = file.split('.')[0];
        let _schema = require(path.join(schemaPath, name));
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
  return modelObj;
};

/**
 * API构建器
 * @param modelObj
 */
pub.apiCreator = (modelObj) => {
  let apiObj = {};
  let apiMap = Conf.schemaGeneralConf.apiMapping;
  _.mapObject(modelObj, (value, key) => {
    apiObj[key] = {};
    let _statics = value.schema.statics;
    let _staticsKey = _.keys(_statics);
    apiObj[key]['model'] = value;
    _.each(apiMap, (_value, _key) => {
      if (_.difference(_staticsKey, _value.needs).length === _staticsKey.length - _value.needs.length) {
        apiObj[key][key + _key] = {func: _value.func, type: _key};
      }
    });
    // if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
    //   apiObj[key][key + _api.name] = {func: _api.func, type: _api.name};
    // }
    // // 创建API
    // _api = apiMap.Create;
    // if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
    //   apiObj[key][key + _api.name] = {func: _api.func, type: _api.name};
    // }
    // // 删除API
    // _api = apiMap.Delete;
    // if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
    //   apiObj[key][key + _api.name] = {func: _api.func, type: _api.name};
    // }
    // // 更新API
    // _api = apiMap.Update;
    // if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
    //   apiObj[key][key + _api.name] = {func: _api.func, type: _api.name};
    // }
    // // 查找API
    // _api = apiMap.Get;
    // if (_.difference(_staticsKey, _api.needs).length === _staticsKey.length - _api.needs.length) {
    //   apiObj[key][key + _api.name] = {func: _api.func, type: _api.name};
    // }
  });
  return apiObj;
};


/**
 * URL构建器
 * @param apiObj model对象数组
 */
pub.urlCreator = (apiObj) => {
  let urlObj = {};
  let _api = Conf.schemaGeneralConf.apiMapping;
  if (apiObj.length === 0) return fcb();
  _.mapObject(apiObj, (value, key) => {
    urlObj[key] = {};
    _.mapObject(value, (_value, _key) => {
      if (_key !== 'model') {
        let _type = _value.type;
        urlObj[key][_key] = {
          url: format(_api[_type].url, key),
          type: _api[_type].type,
          func: _value.func,
          funcType: _value.type
        };
      } else {
        urlObj[key]['model'] = _value;
      }
    })
  });
  return urlObj;
};

module.exports = pub;

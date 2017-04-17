/**
 * Created by CoderSong on 17/4/16.
 * schema到mongo的连接器
 */

let pub = {};
let Mongoose = require('mongoose');
let path = require('path');
let Promise = require('promise');
let Conf = require('./factory/confFactory');
let _ = require('underscore');
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
 * @param scb
 * @param fcb
 */
pub.apiCreator = (modelObj, scb, fcb) => {

};



/**
 * URL构建器
 * @param apiObj model对象数组
 * @param scb
 * @param fcb
 */
pub.restfulUrlCreator = (apiObj, scb, fcb) => {
  _.each(modelObj,)
};


module.exports = pub;

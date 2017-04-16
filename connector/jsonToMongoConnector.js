/**
 * Created by CoderSong on 17/4/13.
 * json到MongoDB的连接器（仅对jsonParser进行连接）
 */

let pub = {};
let Parser = require('./../factory/parserFactory');
let _ = require('underscore');
let Conf = require('./../factory/confFactory');
let Mongoose = require('mongoose');

/**
 * json到mongo的连接器
 * @param scb
 * @param fcb
 */
pub.jsonMongoConnector = (scb, fcb) => {
  Parser.jsonParser.classFileFinder((objList) => {
    let schemaObj = {};
    let modelObj = {};

    try {
      _.each(objList, (obj) => {
        let _schema = new Mongoose.Schema(obj.classObj);
        // 添加通用属性
        _schema.add(Conf.schemaGeneralConf.globalAtr);
        // 添加初始化中间件
        _schema.pre = Conf.schemaGeneralConf.hooksOp.pre;
        // 添加初始化方法
        _schema.statics = Conf.schemaGeneralConf.staticsOp;
        schemaObj[obj.className] = _schema;
        modelObj[obj.className] = Mongoose.model(obj.className, _schema);
      });
      // TODO 对自定义func的转译
      scb(modelObj);
    } catch (err) {
      if (err) fcb("连接器出现异常", err);
    }
  }, (err) => {
    fcb(err);
  });
};

module.exports = pub;

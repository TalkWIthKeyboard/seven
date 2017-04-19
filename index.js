/**
 * Created by CoderSong on 17/4/17.
 */

let pub = {};
let _ = require('underscore');
let Promise = require('promise');
let express = require('express');
let colors = require('colors');
let router = express.Router();
let _model = require('./lib/creator').modelCreator;
let _api = require('./lib/creator').apiCreator;
let _url = require('./lib/creator').urlCreator;

/**
 * 创造器
 * @param schemaPath
 * @param rule
 * @param scb 成功回调
 * @param fcb 失败回调
 */
pub.creator = (schemaPath, scb, fcb) => {
  Promise.resolve(schemaPath)
    .then(_model)
    .then(_api)
    .then(_url)
    .then((urlObj) => {
      _.each(_.values(urlObj), (value) => {
        let model = value.model;
        _.each(_.mapObject(value), (_value, _keys) => {
          if (_keys === 'model') return;
          if (_value.type === 'get') {
            // GET
            if (_value.funcType === 'Retrieve')
              router.get(_value.url, (req, res, next) => {
                _value.func(req, res, model, ['id'], next);
              });
            // Pagination
            if (_value.funcType === 'Pagination')
              router.get(_value.url, (req, res, next) => {
                _value.func(req, res, model, ['page'], next)
              });
          }
          // Create
          if (_value.type === 'post') {
            router.post(_value.url, (req, res, next) => {
              _value.func(req, res, model, null, null, next);
            });
          }
          // Delete
          if (_value.type === 'delete') {
            router.delete(_value.url, (req, res, next) => {
              _value.func(req, res, model, ['id'], next)
            });
          }
          // Update
          if (_value.type === 'put') {
            router.put(_value.url, (req, res, next) => {
              _value.func(req, res, model, ['id'], null, next)
            });
          }
        })
      });

      // 输出API
      _.each(urlObj, (value) => {
        let name = value.model.collection.name;
        console.log('\n', colors.gray(name));
        delete value.model;
        _.each(value, (_value) => {
          console.log('   ', _value.funcType.cyan, _value.type.green, _value.url.blue);
        });
      });

      scb(router);
    })
    .catch((err) => {
      fcb(err);
    });
};

/**
 * 错误中间件
 */
pub.errorHandler = require('./lib/error').errorHandler;

module.exports = pub;
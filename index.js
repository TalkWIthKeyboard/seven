/**
 * Created by CoderSong on 17/4/17.
 */

let pub = {};
let _ = require('underscore');
let fs = require('fs');
let path = require('path');
let Promise = require('promise');
let colors = require('colors');
let _model = require('./lib/creator').modelCreator;
let _api = require('./lib/creator').apiCreator;
let _url = require('./lib/creator').urlCreator;
let authorityFilter = require('./lib/authority').authorityFilter;
let apiMap = require('./lib/factory/confFactory').schemaGeneralConf.apiMapping;

/**
 * 错误中间件
 */
pub.errorHandler = require('./lib/error').errorHandler;

/**
 * 创造器
 * @param app
 * @param router
 * @param schemaPath
 * @param fcb 失败回调
 */
pub.creator = (app, router, schemaPath, fcb) => {
  let configure = require(path.join(__dirname, '..', '..', '.seven.json'));
  let rule = configure.rule;
  let authority = configure.authority;
  let _rule = {};

  Promise.resolve(schemaPath)
    .then(_model)
    .then(_api)
    .then(_url)
    .then((urlObj) => {

      // 处理规则
      _.each(_.keys(urlObj), (key) => {
        _rule[key + 's'] = {};
        _.each(_.keys(apiMap), (func) => {
          _rule[key + 's'][func] = true;
        });
      });
      _.mapObject(rule, (value, key) => {
        _.mapObject(value, (_value, _key) => {
          _rule[key + 's'][_key] = _value;
        });
      });

      // 生成映射
      _.each(_.values(urlObj), (value) => {
        let model = value.model;
        _.each(_.mapObject(value), (_value, _keys) => {
          if (_keys === 'model') return;
          let func = _rule[model.collection.name][_value.funcType];
          if (func) {
            // GET
            if (_value.funcType === 'Retrieve')
              router.get(_value.url, (req, res, next) => {
                _value.func(req, res, model, func.paramsList || ['id'], next);
              });

            // Pagination
            if (_value.funcType === 'Pagination')
              router.get(_value.url, (req, res, next) => {
                _value.func(req, res, model, func.paramsList || ['page'], next);
              });

            // Create
            if (_value.funcType === 'Create')
              router.post(_value.url, (req, res, next) => {
                func.bodyList
                  ? _value.func(req, res, model, func.bodyList, func.key || null, next)
                  : _value.func(req, res, model, null, func.key || null, next);
              });

            // Delete
            if (_value.funcType === 'Delete')
              router.delete(_value.url, (req, res, next) => {
                _value.func(req, res, model, func.paramsList || ['id'], next);
              });

            // Update
            if (_value.funcType === 'Update')
              router.put(_value.url, (req, res, next) => {
                func.bodyList
                  ? _value.func(req, res, model, func.paramsList || ['id'], func.bodyList, next)
                  : _value.func(req, res, model, func.paramsList || ['id'], null, next);
              });

            // Login
            if (_value.funcType === 'Login')
              router.post(_value.url, (req, res, next) => {
                _value.func(req, res, model, next);
              });
          }
        });
      });

      // 输出API
      _.each(urlObj, (value) => {
        let name = value.model.collection.name;
        console.log('\n', colors.gray(name));
        delete value.model;
        _.each(value, (_value) => {
          if (_rule[name][_value.funcType])
            console.log('   ', _value.funcType.cyan, _value.type.green, _value.url.blue);
        });
      });

      // 中间件
      if (authority) app.use(authorityFilter());
      app.use(router);
      app.use(pub.errorHandler());
    })
    .catch((err) => {
      fcb(err);
    });
};


module.exports = pub;

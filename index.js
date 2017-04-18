/**
 * Created by CoderSong on 17/4/17.
 */

let pub = {};
let Promise = require('promise');
let express = require('express');
let _ = require('underscore');
let router = express.Router();
let _model = require('./lib/creator').modelCreator;
let _api = require('./lib/creator').apiCreator;
let _url = require('./lib/creator').urlCreator;

/**
 * 创造器
 * @param schemaPath
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
            if (_value.funcType === 'Get')
              router.get(_value.url, (req, res, next) => {
                _value.func(req, res, model, ['id'], next);
              });
            // Pagination
            if (_value.funcType === 'Pagination')
              router.get(_value.url, (req, res, next) => {
                _value.func(req, res, model, ['page'], next)
              });
          }
          if (_value.type === 'post') {
            // Create
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
          scb(router);
        })
      });
    })
    .catch((err) => {
      fcb(err);
    });
};

module.exports = pub;
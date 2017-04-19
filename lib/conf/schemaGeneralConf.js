/**
 * Created by CoderSong on 17/4/16.
 * Schema通用配置
 */

let pub = {};
let pageSize = require('./../default').pageSize;
let defaultFunc = require('./../default');

// 通用属性
pub.globalAtr = {
  // 时间参数
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
};

// 通用静态方法
pub.staticsOp = {
  findAllByPage: function (thisPage, cb) {
    return this
      .find({})
      .skip((thisPage - 1) * pageSize)
      .limit(pageSize)
      .sort('meta.createAt')
      .exec(cb)
  },

  findAllCount: function (cb) {
    return this
      .find({})
      .count()
      .exec(cb)
  },

  /**
   * 重复检查
   * @param key 键名
   * @param value 值
   * @param cb
   * @returns {Promise}
   */
  checkIsExist: function (key, value, cb) {
    let obj = {};
    obj[key] = value;
    return this
      .findOne(obj)
      .exec(cb)
  },

  findById: function (id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  },

  deleteById: function (id, cb) {
    return this
      .remove({_id: id})
      .exec(cb)
  }
};

// 通用钩子方法（分pre与post）
pub.hooksOp = {
  pre: {
    updateDate: (next) => {
      this.isNew
        ? this.meta.createAt = this.meta.updateAt = Date.now()
        : this.meta.updateAt = Date.now();
      next();
    }
  },
  post: {

  }
};

// api的方法名映射，以及需求
pub.apiMapping = {
  Pagination: {
    name: 'Pagination',
    func: defaultFunc.pagination,
    needs: ['findAllByPage', 'findAllCount'],
    url: '/{}/page/:page',
    type: 'get'
  },
  Create: {
    name: 'Create',
    func: defaultFunc.create,
    needs: [],
    url: '/{}',
    type: 'post'
  },
  Delete: {
    name: 'Delete',
    func: defaultFunc.delete,
    needs: ['deleteById'],
    url: '/{}/:id',
    type: 'delete'
  },
  Update: {
    name: 'Update',
    func: defaultFunc.update,
    needs: ['findById'],
    url: '/{}/:id',
    type: 'put'
  },
  Retrieve: {
    name: 'Retrieve',
    func: defaultFunc.get,
    needs: ['findById'],
    url: '/{}/:id',
    type: 'get'
  }
};

module.exports = pub;
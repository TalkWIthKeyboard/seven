/**
 * Created by CoderSong on 17/4/18.
 */

let pub = {};

pub.resSuccessBuilder = (res, data) => {
  return data
    ? res.json({"code": 200, "data": data})
    : res.json({"code": 200});
};

pub.resErrorBuilder = (res, code, err) => {
  return err
    ? res.json({"code": code, "err": err})
    : res.json({"code": code});
};


module.exports = pub;
# seven-express
![node-icon](https://img.shields.io/badge/node-6.2.2-blue.svg) ![express-icon](https://img.shields.io/badge/express-4.15.2-yellow.svg) ![mongoose-icon](https://img.shields.io/badge/mongoose-4.9.4-yellow.svg) ![build-icon](https://img.shields.io/badge/build-passing-brightgreen.svg)

> This is a plug-in in node.js mapping **API** and **Mongoose.Schema** automatically.
> Version: 0.0.3

## Installation

```
$ npm install --save seven-express
```

## API
+ **creator( schemaFile, rule, scb, fcb )**
    + API的构造器
    + **schemaFile：** schema文件夹的路径
    + **rule：** 规则文件，如果为空，默认启用所有APi
    + **scb：** 成功回调
    + **fcb：** 失败回调
+ **errorHandler( )**
    + 异常处理中间件
    + 也可以使用自己的异常处理中间件，但是必须有**异常处理中间件**

## Usage
+ 在项目目录下新建 ```schema``` 文件夹，在文件夹下新建各种schema文件。
+ 在 ```app.js``` 中进行配置

    ```
    let express = require('express');
    let seven = require('seven-express');
    let promise = require('promise');
    let app = express();

    // 配置文件
    let rule = {
      user : {
        Create: {
          key: 'username',
          bodyList: ['username', 'type']
        },
        Update: {
          bodyList: ['username']
        },
        Delete: false
      }
    };

    // 进行调用
    new Promise((resolve, reject) => {
      seven.creator(path.join(__dirname, 'schema'), rule,  (routers) => {
        resolve(routers);
      }, (err) => {
        reject(err);
      })
    }).then((routers) => {
      app.use(routers);
      app.use(seven.errorHandler());
    });
    ```
+ 运行 ```app.js``` 会显示现在生成的API，可以直接调用

    ```
    users
        Pagination get /user/page/:page
        Create post /user
        Delete delete /user/:id
        Update put /user/:id
        Retrieve get /user/:id
    ```

## Rule
+ 一级 **key** 必须对应 **schema** 名.
+ 默认是启用所有API，可以设置为false来关闭API.
+ **Create：** 提供 **key** 与 **bodyList** 属性
    + **key：** 表中的主键（值有唯一性）
    + **bodyList：** body的表单检测属性，默认为 ```null```
+ **Update：** 提供 **bodyList** 与 **paramsList** 属性
    + **bodyList：** body的表单检测属性，默认为 ```null```
    + **paramsList：** params的检测属性，默认为 ```['id']```
+ **Delete：** 提供 **paramsList** 属性
    + **paramsList：** params的检测属性，默认为 ```['id']```
+ **Pagination：** 提供 **paramsList** 属性
    + **paramsList：** params的检测属性，默认为 ```['page']```
+ **Retrieve：** 提供 **paramsList** 属性
    + **paramsList：** params的检测属性，默认为 ```['id']```



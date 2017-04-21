# seven-express
![node-icon](https://img.shields.io/badge/node-6.2.2-blue.svg) ![express-icon](https://img.shields.io/badge/express-4.15.2-yellow.svg) ![mongoose-icon](https://img.shields.io/badge/mongoose-4.9.4-yellow.svg) ![build-icon](https://img.shields.io/badge/build-passing-brightgreen.svg)

> This is a plug-in in node.js mapping **RestfulAPI** and **Mongoose.Schema** automatically.
> Version: 0.0.7

## Installation

```
$ npm install --save seven-express@0.0.7
```

## API
+ **creator( app, router, schemaPath, fcb )**
    + API的构造器
    + **app：** express实例
    + **router：** express.Router实例
    + **schemaFile：** schema文件夹的路径
    + **fcb：** 失败回调（可以省略）
+ **errorHandler( )**
    + 异常处理中间件
    + 在 ```creator``` 中会自动使用，现在不支持自定义异常处理中间件，将会在以后版本支持

## Module
### Mapping
提供Mongoose到Restful API的自动映射，现在提供**增**、**删**、**查**、**改**，**分页查找**的通用API，并且在内部添加参数检查以及异常处理功能，需要在 ```.seven.json``` 中的 ```rule``` 属性进行配置，所有API默认是打开。
#### 参数检查
对于参数检查，现在主要是对 ```req.body``` 与 ```req.params``` 进行检查，以后版本将会支持 ```req.query``` 的检查。需要在

+ **req.body：** 检查时有两种方式，一种是直接对**schema**的所有属性进行参数检查，这种方式是默认的，不用在**rule**文件中进行配置。另一种是对rule文件中的 ```bodyList``` 属性进行配置，只接受数组对象，会自动对数组中的属性进行参数检查。
+ **req.params：** 检查时是会对 ```paramsList``` 中的属性进行参数检查，不过现版本如果不配置将会有默认的检查参数。**因为现版本会未实现自定义的API功能，所以最好不要自行对 ```paramsList``` 进行配置，主要是对未来版本的支持。**

### 权限管理
在**v0.0.7**版本引入了权限管理功能，与 ```mapping rule``` 一样，仅需要在 ```.seven.json``` 中的 ```authority``` 属性进行配置即可。**如果要关闭该功能，在 ```.seven.json``` 中将 ```authority```  设置为 ```false``` 即可。**

+ 权限管理功能需要**session**的支持，所以在使用该中间件之前先引入**session**相关的中间件，这里推荐 ```cookie-parser``` 和 ```express-session```
+ 权限管理功能需要有**user**表的支持，并且需要在**user**表中有 ```username``` , ```password``` , ```role```属性的支持。
    + **username：** 用户名
    + **password：** 用户密码
    + **role：** 用户的角色
+ 权限管理功能是通过登录用户的角色来决定他是否能对请求的URL进行访问，所以权限管理功能会自动为```user schema```绑定上**Login**的API，以后版本会支持自定义。

## Usage
+ 在项目目录下新建 ```schema``` 文件夹，在文件夹下新建各种schema文件。

    ```
    const mongoose = require('mongoose');

    let User = new mongoose.Schema({
      username: String,
      password: String,
      role: String,
    });

    module.exports = User;
    ```
+ 在项目目录下新建 ```.seven.json``` 文件，进行配置。

    ```
    {
      "rule": {
        "user" : {
          "Create": {
            "key": "username",
            "bodyList": ["username", "role"]
          },
          "Update": {
            "bodyList": ["username"]
          }
        }
      },
      "authority": {
        "role": ["admin", "user", "superadmin"],
        "filter": {
          "user": {
            "Create": false,
            "Retrieve": ["admin"],
            "Update": ["user", "admin", "superadmin"]
          }
        }
      }
    }
    ```
+ 在 ```app.js``` 中进行引入

    ```
    let express = require('express');
    let cookie = require('cookie-parser');
    let session = require('express-session');
    let seven = require('seven-express');
    let router = express.Router();
    let app = express();

    // 引入session和cookie的中间件
    app.use(cookieParser());
    app.use(session({
      secret: '12345',
      name: 'testapp',
      cookie: {maxAge: 80000 },
      resave: false,
      saveUninitialized: true
    }));

    // 引入seven中间件
    seven.creator(app, router, path.join(__dirname, 'schema'));
    ```

+ 运行 ```app.js``` 会显示现在生成的API，可以直接调用

    ```
    users
        Pagination get /user/page/:page
        Create post /user
        Delete delete /user/:id
        Login post /login
        Update put /user/:id
        Retrieve get /user/:id
    ```

## Configuration
### Rule
```rule``` 属性当中是对API的开放状态以及参数检查的属性进行配置。所以一级 **key** 必须对应 **schema** 名。默认是启用所有API，可以设置为**false**来关闭API。

#### Create
提供 **key** 与 **bodyList** 属性

+ **key：** 表中的主键（值有唯一性）
+ **bodyList：** body的表单检测属性，默认为 ```null```

#### Update
提供 **bodyList** 与 **paramsList** 属性

+ **bodyList：** body的表单检测属性，默认为 ```null```
+ **paramsList：** params的检测属性，默认为 ```['id']```

#### Delete
提供 **paramsList** 属性

+ **paramsList：** params的检测属性，默认为 ```['id']```

#### Pagination
提供 **paramsList** 属性

+ **paramsList：** params的检测属性，默认为 ```['page']```

#### Retrieve
提供 **paramsList** 属性

+ **paramsList：** params的检测属性，默认为 ```['id']```

### Authority
```authority``` 属性当中是对API的权限状态进行管理，在```authority.role``` 中声明所有的角色，在```authority.filter``` 中声明API允许的权限列表，如果不进行设置默认是对所有用户开放（包括未登陆用户）。

## License
MIT


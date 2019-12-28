const Express = require('express');
const path = require('path');
const app = Express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expSession = require('express-session');
const {
  myQuery
} = require('./models/mysql');
const {
  uuid36,
  encrypt,
  decrypt
} = require('./models/crypto');
const config = require('./config');

// 设置静态目录
app.use(Express.static(path.join(__dirname, '../public/')));


app.set('views', path.join(__dirname, 'views'));

// app.engine('handlebars', exphbs());
app.engine('hbs', exphbs.create({
  // 布局目录是相对于 setting views 目录的 layouts 目录 （默认）
  layoutsDir: '',
  // 配置布局主文件
  defaultLayout: 'main',
  // 修改模板文件后缀名；后缀名修改之后，对应的engine名称也要跟着改变
  extname: '.hbs',
  // 配置部分模板目录 相对于 setting views 目录的 partials 目录 （默认）
  partialsDir: '',
  // 段落使用
  helpers: {
    section(name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  }
}).engine);

app.set('view engine', 'hbs');


// 解析网络请求参数 parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// application/json
app.use(bodyParser.json());

// 配置cookie和session
app.use(cookieParser());
app.use(expSession({
  key: config.cookie.key, // 设置cookie中保存sessionId的字段名
  secret: config.cookie.secret, // 通过secret值计算hash值
  resave: config.cookie.resave, // 强制更新session值
  saveUninitialized: config.cookie.saveUninitialized, // 初始化cookie值
  cookie: {
    maxAge: config.cookie.maxAge
  }
}));

app.use(function (req, res, next) { //all
  if (!req.session.alert) {
    next();
  } else {
    res.locals.flash = req.session.alert;
    req.session.alert = null;
    next();
  }
})

// 白名单，过滤请求链接 - url不在白名单的请求且没有session，重定向到登录界面
const WHITE_LIST = [
  '/',
  '/register',
  '/login'
];

app.use((req, res, next) => {
  if (!WHITE_LIST.includes(req.url) && !req.session.user) {
    // 跳转至登录
    res.redirect('/');
    return;
  } else {
    console.log('>>>>>>>>>>');
    if (req.method.toUpperCase() === 'POST')
      console.log(req.method.toUpperCase() + ' ' + req.url, req.body);
    else
      console.log(req.method.toUpperCase() + ' ' + req.url);
    next();
  }
})

// 视图渲染登录页面
app.get('/', (req, res) => {
  res.render('login', {
    title: '用户登录',
    layout: false
  });
})

/**
 * 渲染注册页面
 */
app.get('/register', (req, res) => {
  res.render('register', {
    title: '用户注册',
    layout: false
  });
});

// 登录动作
app.post('/login', (req, res) => {
  console.log('后台接收到的数据', req.body.username)
  myQuery('select * from `user` where username=?', [req.body.username]).then(data => {
    // console.log('后台接收到的数据', data)
    // 解密判断密码是否一致
    if (decrypt(data[0].password) === req.body.password) {
      // 返回登录成功
      // TODO session 存储用户信息
      console.log(data);
      req.session.user = null;
      req.session.user = data[0].username;
      req.session.userid = null;
      req.session.userid = data[0].id;

      return res.send("<script>alert('登录成功');location.href='/admin';</script>")
      //return res.redirect(303, '/admin')

    } else {
      return res.send("<script>alert('登录失败， 密码错误');history.back()</script>")
    }
  }).catch(err => {
    return res.send("<script>alert('登录失败， 用户不存在');history.back()</script>")
    // TODO 错误处理
  })

  // select * from user where username=req.body.username 
  // 明文密码 select * from user where username=req.body.username and password=req.body.password
  // 密文密码 获取数据库的密文密码
  // 解密数据库里面的密码
  // 比对两个密码是或否一致

  // select * from user where username=req.body.username
  // 数据库里里面的password和用户传过来的password比较
  // rows.password === req.body.password
  // 很大的BUG存在

  // return res.redirect(301, '/index')
})


/**
 * 注册动作
 */
app.post('/register', (req, res) => {
  console.log('后台接收到的注册数据', req.body);
  let {
    username,
    password,
    repassword,
    sex,
    email
  } = req.body;

  // 数据校验
  // 用户名不能为空；密码不能为空；两次密码一致；邮箱格式验证
  if (!username) {
    //let 
    return res.send("<script>alert('用户名不能为空');history.back()</script>")
    // TODO 提示用户名不能为空
    // return ;
  }
  if (!password || !repassword) {
    return res.send("<script>alert('密码不能为空');history.back()</script>")
    // TODO 提示用户两次密码不能为空
  }
  if (password !== repassword) {
    return res.send("<script>alert('两次密码不一致');history.back()</script>")
    // TODO 两次密码不一致
  }
  let VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!email.match(VALID_EMAIL_REGEX)) {
    return res.send("<script>alert('邮箱格式不正确');history.back()</script>")
    // TODO 邮箱格式不正确
  }

  // 整理写入数据库的数据项
  // console.log(uuid36());
  // console.log(encrypt(password));

  myQuery('select * from `user` where email=?', [email]).then(data => {
    console.log(data); // []
    if (!data.length) {
      console.log(uuid36(), username, encrypt(password), email, sex);
      // TODO 没有查出结果

      myQuery('insert into `user` (`id`, `username`, `password`, `email`, `sex`) values(?,?,?,?,?)', [uuid36(), username, encrypt(password), email, sex]).then(data2 => {
        console.log(data2);
        return res.send('注册成功');
      }).catch(error => {
        console.error(error);
        // TODO 数据库错误处理，注册失败
        return res.send('注册失败');
      })
    } else {
      // TODO 反馈用户，邮箱已经存在
      return res.send('邮箱已存在');
    }
  }).catch(error => {
    // TODO 数据库错误处理
    console.error(error);
    return res.send("<script>alert('服务器内部错误');history.back()</script>")
  })
});
//------------------------------------------------注册结束

app.post('/index', (req, res) => {
  console.log(req.body.title);
  let errors = [];
  if (!req.body.title) {
    errors.push({
      type: 'warning',
      message: '标题不能为空'
    })
  }
  if (!req.body.content) {
    errors.push({
      type: 'warning',
      message: '内容不能为空'
    })
  }
  if (errors.length) {
    req.session.alert = errors;
    return res.redirect('/admin');
  }
  myQuery('insert into `post`(`id`,`title`,`summary`,`content`,`createtime`,`userid`) values(?,?,?,?,?,?)', [uuid36(), req.body.title, req.body.summary, req.body.content, Date.now(), req.session.userid]).then(data3 => {
    return res.redirect('/admin');
  }).catch(error => {
    console.error(error);
    return res.redirect('/admin');
  })
})

app.post('/del', (req, res) => {
  myQuery('UPDATE `post` SET status = 1 where id =?', [req.body.id]).then(data => {
    let success = [];
    success.push({
      type: 'success',
      message: '删除成功'
    })
    req.session.alert = success;
    return res.redirect('/admin');
  }).catch(error => {
    console.error(error);
    return res.redirect('/admin');
  })
})

//------------------------------修改密码
app.post('/cha_pas', (req, res) => {
  let errors = [];
  if (!(req.body.pas_1 && req.body.pas_2)) {
    errors.push({
      type: 'warning',
      message: '请输入密码'
    })
  }
  if (req.body.pas_1 != req.body.pas_2) {
    errors.push({
      type: 'warning',
      message: '两次密码不一致'
    })
  }
  if (errors.length) {
    req.session.alert = errors;
    return res.redirect('/changepassword');
  }
  myQuery('UPDATE `user` SET password = ? where id = ?', [encrypt(req.body.pas_2), req.session.userid]).then(data => {
    let success = [];
    success.push({
      type: 'success',
      message: '更改成功'
    })
    req.session.alert = success;
    return res.redirect('/admin');
  }).catch(error => {
    console.error(error);
    return res.redirect('/admin');
  })
})

//------------------------修改内容
app.post('/edit', (req, res) => {
  let success = [];
  if (req.body.tit_cha && req.body.sum_cha && req.body.con_cha) {
    if (req.body.tit_cha) {
      console.log("111111111111");
      myQuery('UPDATE `post` set title = ?, summary=?,  content = ? where id = ?', [req.body.tit_cha, req.body.sum_cha, req.body.con_cha, req.body.id]).then(data => {
        success.push({
          type: 'success',
          message: '修改成功'
        })
        req.session.alert = success;
        return res.redirect('/admin');
      }).catch(error => {
        console.error(error);
        return res.redirect('/edit');
      })
    }
    // if (req.body.sum_cha) {
    //   myQuery('UPDATE `post` set summary = ? where id = ?', [req.body.sum_cha, req.body.id]).then(data => {
    //     success.push({
    //       type: 'success',
    //       message: '修改成功'
    //     })
    //     req.session.alert = success;
    //     return res.redirect('/admin');
    //   }).catch(error => {
    //     console.error(error);
    //     return res.redirect('/edit');
    //   })
    // }
    // if (req.body.con_cha) {
    //   myQuery('UPDATE `post` set content = ? where id = ?', [req.body.con_cha, req.body.id]).then(data => {
    //     success.push({
    //       type: 'success',
    //       message: '修改成功'
    //     })
    //     req.session.alert = success;
    //     return res.redirect('/admin');
    //   }).catch(error => {
    //     console.error(error);
    //     return res.redirect('/edit');
    //   })
    // }
  }
  // if(success.length){
  //   req.session.alert = success;
  //   return res.redirect('/admin');
  else {
    let errors = [];
    errors.push({
      type: 'warning',
      message: '请输入更改内容'
    })
    req.session.alert = errors;
    return res.redirect('/edit?id=' + req.body.id);
  }
})


/**
 * 渲染后台首页模板
 * TODO 判断session中是否存在用户信息
 */
// let middlware = (req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect('/');
//   }
//   next();
// }

app.get('/admin', (req, res) => {
  //TODOa
  myQuery('select * from `post` where status=0 and userid=?', [req.session.userid]).then(data => {

    return res.render('admin/index', {
      list: data
    }); //rander渲染视图
  }).catch(errror => {
    console.error(error);
  })
})
//删除
app.get('/del', (req, res) => {
  return res.redirect('/admin');
})

/**
 * GET /user 用户中心
 */
app.get('/user', (req, res) => {
  myQuery('select * from user where username=?', [req.session.user]).then(data => {
    return res.render('admin/usercenter', {
      list: data
    });
  }).catch(e => {
    res.send("<script>alert('服务器内部错误');history.back()</script>")
  })
});


/**
 * POST /user 修改用户信息
 */
app.post('/user', (req, res) => {
  const {
    username,
    email,
    sex,
    id
  } = req.body;
  myQuery('update user set username=?, email=?, sex=? where id=?', [username, email,  sex || 0, id]).then(data => {
    req.session.user = username;
    res.redirect('/admin');
    return;
  }).catch(err => {
    console.error(err);
    res.send("<script>alert('服务器内部错误');history.back()</script>")
    return
  })
})

//修改密码
app.get('/changepassword', (req, res) => {
  return res.render('admin/changepassword');
})

//编辑内容
app.get('/edit', (req, res) => {
  myQuery('select * from `post` where id=?', [req.query.id]).then(data => {
    return res.render('admin/edit', {
      list: data
    });
  }).catch(errror => {
    console.error(error);
  })
})

app.get('/out', (req, res) => {
  req.session.destroy()
  // req.session.user = null;
  return res.redirect('/');
});

// 404页面
app.use((req, res, next) => {
  res.type('text/plain').status(404).send('404-Not Found');
  next();
})

// 500
app.use((error, req, res, next) => {
  console.log('服务器报错', error);
  return res.status(500).send('500 - Server Error');
})

app.listen(3000, () => {
  console.log('Server Start on http://127.0.0.1:3000')
})
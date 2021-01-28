const { Router } = require("express");
const { myQuery } = require("../models/mysql");
const { uuid36, encrypt, decrypt } = require("../models/crypto");
const router = Router();

router.post("/add", async (req, res) => {
  console.log(req.body);
  let errors = [];
  if (!req.body.title) {
    errors.push({
      type: "warning",
      message: "标题不能为空",
    });
  }
  if (!req.body.content) {
    errors.push({
      type: "warning",
      message: "内容不能为空",
    });
  }
  if (errors.length) {
    req.session.alert = errors;
    return res.redirect("/");
  }

  try {
    const insertRS = await myQuery(
      "insert into `post`(`id`,`title`,`summary`,`content`,`createtime`,`userid`) values(?,?,?,?,?,?)",
      [
        uuid36(),
        req.body.title,
        req.body.summary,
        req.body.content,
        Date.now(),
        req.session.userid,
      ]
    )
    console.log(insertRS);
    res.redirect("/");
    return;
  } catch (error) {
    console.error(error);
    return res.redirect("/");
  };
});


router.post("/del", (req, res) => {
  myQuery("UPDATE `post` SET status = 1 where id =?", [req.body.id]).then((data) => {
    let success = [];
    success.push({
      type: "success",
      message: "删除成功",
    });
    req.session.alert = success;
    return res.redirect("/");
  }).catch((error) => {
    console.error(error);
    return res.redirect("/");
  });
});


//编辑内容
router.get("/edit", (req, res) => {
  myQuery("select * from `post` where id=?", [req.query.id]).then((data) => {
    return res.render("admin/edit", {
      list: data,
    });
  }).catch((errror) => {
    console.error(error);
  });
});

// 修改内容
router.post("/edit", (req, res) => {
  let success = [];
  if (req.body.tit_cha && req.body.sum_cha && req.body.con_cha) {
    if (req.body.tit_cha) {
      console.log("111111111111");
      myQuery(
        "UPDATE `post` set title = ?, summary=?,  content = ? where id = ?",
        [req.body.tit_cha, req.body.sum_cha, req.body.con_cha, req.body.id]
      ).then((data) => {
        success.push({
          type: "success",
          message: "修改成功",
        });
        req.session.alert = success;
        return res.redirect("/");
      }).catch((error) => {
        console.error(error);
        return res.redirect("/posts/edit");
      });
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
      type: "warning",
      message: "请输入更改内容",
    });
    req.session.alert = errors;
    return res.redirect("/edit?id=" + req.body.id);
  }
});

module.exports = router;

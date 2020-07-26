var express = require('express');
var router = express.Router();

const fb = require('../fb');
//para encriptar clave
var md5 = require('md5');

var db = fb.database();
var ref = db.ref("usuario");
var refAdmin = db.ref("admin");

//guardar usuarios
router.post('/save', function (req, res, next) {
  var nombre = req.body.nombre;
  var keyUser = "";
  ref.orderByChild('nombre').equalTo(nombre).on('child_added', function (snapshot) {
    keyUser = snapshot.key;
  }, function (err) {
    res.json({ "flag": "error:" + err });
  });

  ref.once("value", function (snap) {
    if (keyUser == "") {
      var usuario = ref.push();
      usuario.set({
        "nombre": nombre
      });
      res.json({ "flag": "si", "id": usuario.key });
    } else {
      res.json({ "flag": "si", "id": keyUser });
    }
  });
});

//guardar admin
router.post('/saveAdmin', function (req, res, next) {
  var contar = 0;
  var user = req.body.user;
  var pss = md5(req.body.pss);
  refAdmin.orderByChild('user').equalTo(user).on('child_added', function (snapshot) {
    contar++;
  }, function (err) {
    res.json({ "flag": "error:" + err });
  });

  refAdmin.once("value", function (snap) {
    if (contar == 0) {
      var admin = refAdmin.push();
      admin.set({
        "user": user,
        "pass": pss
      });
      res.json({ "flag": "si", "id": admin.key });
    } else {
      res.json({ "flag": "no" });
    }
  });

});

//login admin
router.post('/login', function (req, res, next) {
  var user = req.body.user;
  var pss = md5(req.body.pss);
  var encontro = false;
  refAdmin.orderByChild('user').equalTo(user).on('child_added', function (snapshot) {
    var admins = snapshot.val();
    if (admins.pass == pss) {
      encontro = true;
      res.json({ "flag": "si", "admin": admins });
    }
  }, function (err) {
    res.json({ "flag": "error:" + err });
  });

  refAdmin.once("value", function (snap) {
    if (!encontro) {
      res.json({ "flag": "no" });
    }
  });

});

//obtener usuarios
router.get('/getUsers', function (req, res, next) {
  var users = [];
  ref.on("child_added", function (snapshot) {
    var temp = snapshot.val();
    temp.id = snapshot.key;
    users.push(temp);
  }, function (err) {
    res.json({ "flag": "error:" + err });
  });
  
  ref.once("value", function (snap) {
    if (users.length>0) {
      res.json({ "flag": "si", "chats": users });
    }else{
      res.json({ "flag": "no" });
    }
  });
});

router.get('/getMessages', function (req, res, next) {
  var idUser = req.query.idUser;
  var messages = [];
  ref.child(idUser+"/mensajes").on("child_added", function (snapshot) {
    messages.push(snapshot.val());
  }, function (err) {
    res.json({ "flag": "error:" + err });
  });
  
  ref.once("value", function (snap) {
    if (messages.length>0) {
      res.json({ "flag": "si", "messages": messages });
    }else{
      res.json({ "flag": "no" });
    }
  });
});

//guardar mensaje
router.post('/saveMsg', function (req, res, next) {
  var msg = req.body.msg;
  var isUser = req.body.isUser;
  var ts = Date.now();
  var date_ob = new Date(ts);
  var fecha = date_ob.getFullYear() + "-" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" + ("0" + date_ob.getDate()).slice(-2) + " " +
    date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds();
  var idUser = req.body.idUser;
  var mensaje = ref.child(idUser+"/mensajes").push();
  mensaje.set({
    "msg": msg,
    "isUser": isUser,
    "fecha": fecha
  });
  res.json({ "flag": "si", "id": mensaje.key });
});




module.exports = router;

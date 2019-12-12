var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/', function (req, res, next) {
	return res.render('index.html');
});


router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.addUser(personInfo.username, personInfo.password);
			res.send({"Success":"Account regestered. Login to proceed."});
		}else{
			res.send({"Success":"Passwords no not match."});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.html');
});

// LOGIN
router.post('/login', function (req, res, next) {

	var check = User.checkLogin(req.body.username, req.body.password);

	console.log("HERE");

	if(check["isSuccess"]) {
		req.session.userId = check["userId"];
		res.send({"Success":"Success!"});
	} else {
		res.send({"Success":"Incorrect username/password!"});
	}
});

router.get('/profile', function (req, res, next) {
	console.log("profile");

	return res.render('data.html', {"name": User.getUsername(session.userId)});
});

// 	LOGOUT
router.get('/logout', function (req, res, next) {

	console.log("logout")
	
	if (req.session) {

    // Delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.html");
});

router.post('/forgetpass', function (req, res, next) {
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This E-mail has not been regestered!"});
		}else{
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password has been changed."});
			});
		}else{
			res.send({"Success":"Passwords no not match."});
		}
		}
	});
	
});

module.exports = router;
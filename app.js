/**
 * Module dependencies.
 */

var express = require('express'),routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path'), fs = require;
var board = require('./routes/board');

var bodyParser = require('body-parser');

var app = express();

//MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 3,
    host: 'ec2-52-78-49-178.ap-northeast-2.compute.amazonaws.com',
    user: 'root',
    database: 'group1',
    password: 'miracom500',
    port : '3306'
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.engine('html', require('ejs').renderFile);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/board', board);

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/top',function(req,res){
	  res.render(path.join(__dirname+'/views/top.html'));
});
app.get('/intro',function(req,res){
	  res.render(path.join(__dirname+'/views/intro.html'));
});
app.get('/setAdver',function(req,res){
	
	pool.getConnection(function (err, connection) {
        // Use the connection
		var sqlForSelectList = "SELECT AD_CODE , AD_MANAGE, AD_NAME, AD_TYPE1,  " +
		"AD_TYPE2, CONTENT_TYPE1, CONTENT_TYPE2,  " +
		"CONTENT_SIZE, CONTENT_URL, ACTIVE_YN   " +
		"FROM  TB_AD_MAST  ";
		
        connection.query(sqlForSelectList, function (err, rows) {
        	if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

      	  //	res.render(path.join(__dirname+'/views/setAdver.html'));
            res.render('setAdver.html', {rows: rows});
            connection.release();
        });
    });

	
});



//화면저장 로직 처리 POST
app.post('/write', function(req,res,next){

  var code = req.body.code;
  var title = req.body.title;
  var creator_id = req.body.creator_id;
  var datas = [code,title,creator_id];

  pool.getConnection(function (err, connection)
  {
      // Use the connection
      var sqlForInsertAdver = "insert into TB_AD_MAST(AD_CODE, AD_MANAGE, AD_NAME, REG_DATE) values(?,?,?, now())";
      connection.query(sqlForInsertAdver,datas, function (err, rows) {
          if (err) console.error("err : " + err);
          console.log("rows : " + JSON.stringify(rows));

          res.redirect('/setAdver');
          connection.release();

          // Don't use the connection here, it has been returned to the pool.
      });
  });
});


//화면저장 로직 처리 POST
app.post('/update', function(req,res,next){

var code = req.body.code;
var title = req.body.title;
var creator_id = req.body.creator_id;
var datas = [title,creator_id,code];

console.log("update : ");
pool.getConnection(function (err, connection)
{
    // Use the connection
    var sqlForUpdateAdver = "update TB_AD_MAST set AD_MANAGE=?, AD_NAME=? , REG_DATE =now() where AD_CODE  = ?";
    connection.query(sqlForUpdateAdver,datas, function (err, rows) {
        if (err) console.error("err : " + err);
        console.log("rows : " + JSON.stringify(rows));

        res.redirect('/setAdver');
        connection.release();

        // Don't use the connection here, it has been returned to the pool.
    });
});
});


app.get('/setCore',function(req,res){
	  res.render(path.join(__dirname+'/views/setCore.html'));
});
app.get('/dashboard',function(req,res){
	  res.render(path.join(__dirname+'/views/dashboard.html'));
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

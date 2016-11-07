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
app.set('port', process.env.PORT || 3002);
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
app.get('/login',function(req,res){
	  res.render(path.join(__dirname+'/views/index.html'));
});

app.get('/top',function(req,res){
	  res.render(path.join(__dirname+'/views/top3.html'));
});

app.get('/intro',function(req,res){
	  res.render(path.join(__dirname+'/views/intro.html'));
});

app.get('/setAdver',function(req,res){

	  res.render(path.join(__dirname+'/views/setAdver.html'));
    
    /*
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
*/
	
});

app.get('/setBeacon',function(req,res){
	  res.render(path.join(__dirname+'/views/setBeacon.html'));
});


app.post('/adver_reg', function(req,res){

	  var company = req.body.company;
	  var title = req.body.addTitle;
	  var content = req.body.addContent;
	  var cost = req.body.cost;
	 // var execute = req.body.execute;
	  var from = req.body.d_from;
	  var to = req.body.d_to;
	  //var chk = req.body.chk;
	  var AppCompany = "C001"; //앱 관리 회사 (헬스플러스톡)
	  var img = req.body.img;
	  
	  console.log(company + " " + title + " " + content + " " + cost );
	  console.log(from + " " +  to + " " );
	  console.log(img );
	  console.log(AppCompany + " ");

	  pool.getConnection(function (err, connection)
	  {
	      // Use the connection
		  var sqlMaxAdCode = "select if(concat('A001',lpad(CONVERT(max(substring(ad_code,5,7)), UNSIGNED)+1,2,'0')) is null, 'A001',concat('A001',lpad(CONVERT(max(substring(ad_code,5,7)), UNSIGNED)+1,2,'0'))) as M_AD_CODE from TB_AD_DETAIL where AD_CODE LIKE 'A001%' ";
		  var adUrl = "samsunghospital.JPG";
		  
		  //MAXADCODE채번
	      connection.query(sqlMaxAdCode, function (err, rows) {
	        	if (err) console.error("err : " + err);
	        	var maxAdCode = rows[0].M_AD_CODE;
	        	
	        	//광고하기테이블(광고detail) 저장
	        	var sqlForInsertAdver = "insert into TB_AD_DETAIL(AD_CODE, AD_NAME, AD_CONTENT," +
	        										"AD_MSG, AD_URL, AD_TYPE, AD_START_DATE, AD_END_DATE, AD_IMG_URL) values (?,?,?,?,?,?,?,?,?)";
	    	    var datas = [maxAdCode, title, content, content, adUrl, cost, from,to,img];
	        	connection.query(sqlForInsertAdver, datas, function (err, rows) {
	                if (err) console.error("err : " + err);
	        	});
	        	
	        	
	        	//MAX제휴코드
	        	var sqlMaxRCode = "select if(concat('R',lpad(CONVERT(max(substring(ad_code,2,4)), UNSIGNED)+1,3,'0')) is null, 'R001', concat('R',lpad(CONVERT(max(substring(ad_code,2,4)), UNSIGNED)+1,3,'0'))) as RCODE from TB_OFFER  ";
	        	var maxRCode = "";
	            connection.query(sqlMaxRCode, function (err, rows) {
	            	if (err) console.error("err : " + err);
	            	maxRCode = rows[0].RCODE;
	            	
	            	console.log("maxRCode::"  + maxRCode);
	            	//제휴테이블 (TB_OFFER) 저장
	                var sqlForInsertsetCore = " insert into TB_OFFER(AD_CODE, OFFER_COMPANY_CODE, TARGET_COMPANY_CODE" +
	        				", OFFER_DATE, ADD_CODE, APPROVAL_YN, APPROVAL_DATE)	values (?,?,?,?,?,?,?)";
	        		datas = [maxRCode, company, AppCompany, "", maxAdCode, "", ""];
	        		
	        		connection.query(sqlForInsertsetCore, datas, function (err, rows) {
	        			if (err) console.error("err : " + err);
	        		});
	            });
	        	
	      });
	            	

    	connection.release();
        res.redirect('/setAdver');
        
	  });
	
});


app.post('/adver_app', function(req,res){

	  var flag = req.body.flag;
	  var rcode = req.body.rcode;
	  console.log("update : " + rcode);
	  pool.getConnection(function (err, connection)
	  {

	      var sqlForUpdateAdver = "update TB_OFFER set APPROVAL_YN = ? , APPROVAL_DATE = now() where AD_CODE = ?";
	        connection.query(sqlForUpdateAdver,[flag, rcode],function(err,result)
	        {
	            console.log(result);
	            if(err) console.error("글 수정 중 에러 발생 err : ",err);
		          res.redirect('/setCore');
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


app.get('/setCore', function(req,res){
	pool.getConnection(function (err, connection) {
        // Use the connection
		var sqlForSelectList =
		" SELECT A.AD_CODE AS RCODE, A.APPROVAL_YN, B.AD_CODE, B.AD_NAME, B.AD_CONTENT, B.AD_MSG, " +
		   "A.OFFER_COMPANY_CODE, IF(A.OFFER_COMPANY_CODE='A001', '강북삼성병원', IF(A.OFFER_COMPANY_CODE='A002', '무궁화요양원', IF(A.OFFER_COMPANY_CODE='A003', '다뺀다 퓌트니스','NONE'))) AS COMNAME, "+
		   "B.AD_URL, B.AD_TYPE, IF(B.AD_TYPE = 'A01', '건당 4원', IF(B.AD_TYPE = 'A02', '건당 5원', IF(B.AD_TYPE = 'A03', '건당 7원', IF(B.AD_TYPE = 'B01', '건당 100원', " +
	       "IF(B.AD_TYPE = 'B02', '건당 120원', IF(B.AD_TYPE = 'B03', '건당 150원', 'NONE NAME')))))) AS TYPENAME, " +
	       "date_format(AD_START_DATE,'%Y-%m-%d') AS AD_START_DATE, date_format(AD_END_DATE,'%Y-%m-%d') AS AD_END_DATE, timestampdiff(month,B.AD_START_DATE,B.AD_END_DATE) AS DIFFMONTH " +
	       ",B.AD_IMG_URL as IMG " +
	       "FROM TB_OFFER A, TB_AD_DETAIL B " +
		   "WHERE A.ADD_CODE = B.AD_CODE " ;
		
        connection.query(sqlForSelectList, function (err, rows) {
        	if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

          res.render('setCore.html', {rows: rows});
            connection.release();
        });
    }); 
});
app.get('/dashboard',function(req,res){
	  res.render(path.join(__dirname+'/views/dashboard.html'));
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

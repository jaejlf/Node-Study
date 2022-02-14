const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(express.urlencoded({extended : true}))
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs')

//var db = require('./database');
const Database = require("@replit/database")
const db = new Database()

const port = 8080
app.listen(port, () => {
  console.log(`${port} 번 포트에 연결 중 ...`);
})

app.get('/', function (req, res) {
  res.render('index.ejs');
}); 

app.get('/write', function (req, res) {
  res.render('write.ejs');
});

app.get('/list', function (req, res) {
  var dataArr = [];
  var cnt = 0;

  db.list().then(keys => {    
    keys.forEach(element => {
      db.get(element).then(value => {
        dataArr.push({
          name: element,
          email: value.email,
          description: value.description
        });
        
        cnt++;
        if(cnt == keys.length){
          //console.log(dataArr)
          res.render('list.ejs', { posts : dataArr })
        }
      });
    });
  });
});

app.post('/add', function (req, res) {
  var key = req.body.name;
  var mydata = {
    email: req.body.email,
    description: req.body.description
  }

  db.set(key, mydata).then(() => {});
  res.send('데이터 전송 완료');
});

app.delete('/delete', function(req, res){
	  console.log(req.body.name) //.ejs에서 보낸, data에 들어있는 값  
    db.delete(req.body.name).then(() => {
      db.list().then(keys => {
        console.log(keys);
        console.log('삭제 완료');
      });
   });
})

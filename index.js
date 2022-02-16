const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Database = require("@replit/database")
const db = new Database()

app.use(express.static(__dirname + '/views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended : true}))

const port = 8080;
app.listen(port, () => {
  console.log(`${port} 번 포트에 연결 중 ...`);
});

app.get('/', function(req, res){
  res.render('index.ejs');
});

app.get('/write', function(req, res){
  res.render('write.ejs');
});

app.get('/list', function(req, res){
  var dataArr = [];
  var cnt = 0;
  
  db.list().then(keys => {
    keys.forEach(element => {
      //console.log(element);
      db.get(element).then(value => {
        //console.log(value);
        dataArr.push(value);

        cnt++;
        if(cnt == keys.length){
          res.render('list.ejs', { posts : dataArr });
        }
      });
    })
  });
});

app.post('/add', function (req, res){
  //console.log(req.body.name);
  var key = req.body.name;
  var mydata = {
    name: req.body.name,
    email: req.body.email,
    description: req.body.description
  }

  if(key == ""){
    res.status(400).send({ message : "name 오류"})
  } else{
    db.set(key, mydata).then(() => {});
    res.send('데이터 전송 완료');
  }
  
  //db.set(key, mydata).then(() => {});
  //res.send('데이터 전송 완료');
});

app.delete('/delete', function (req, res){
  db.delete(req.body.name).then(() => {
    db.list().then(keys => {
      console.log(keys);
      res.status(200).send('삭제 완료');
    });
  });
});

app.get('/getValue/:key', function(req, res){
  //console.log(req.params.key);
  
  db.get(req.params.key).then(value => {
    if(value == null){
      res.status(500).send({ message : "NOT FOUND"})
    }
    res.status(200).send(value);
  });
});
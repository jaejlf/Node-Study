const express = require('express')
const app = express()
const bodyParser = require('body-parser')

var dataArr = [{
  name: "김노드",
  email: "nodejs@mmm.mmm",
  description: "안녕하세요 ~! Node.js 공부 중입니다"
},{
  name: "아마존",
  email: "aws@mmm.mmm",
  description: "저는 서버 구축을 도와줍니다."
},{
  name: "강큐밀",
  email: "kumily@mmm.mmm",
  description: "hi KUSITMS !"
},{
  name: "컴과생",
  email: "comgwa@mmm.mmm",
  description: "cs공부하는 컴과생입니다..."
},{
  name: "흑호랑",
  email: "tiger@mmm.mmm",
  description: "올해는 호랑이해 @-@"
}]

app.use(express.static(__dirname + '/views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended : true}))

//var port = 8080;
var port = process.env.PORT || 8080;
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
  res.render('list.ejs', { posts : dataArr });
});

app.post('/add', function (req, res){
  var key = req.body.name;
  var mydata = {
    name: req.body.name,
    email: req.body.email,
    description: req.body.description
  }

  if(key == ""){
    res.status(400).send({ message : "name 오류"})
  } else{
    dataArr.push(mydata);
    res.send('데이터 전송 완료');
  }
});

app.delete('/delete', function (req, res){
  var value = req.body.name;
  dataArr = dataArr.filter(function(item){
    return item.name !== value;
  })
  res.status(200).send('삭제 완료');
});

app.get('/getValue/:key', function(req, res){
  var ck = 0;
  var key = dataArr.filter(function(item){
    if(req.params.key == item.name){
      ck = 1;
      res.status(200).send(item);
      return;
    }
  })
  if(ck == 0){
    res.status(500).send({ message : "NOT FOUND"})
  }
});
const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(express.urlencoded({extended : true}))
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs')

var port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`${port} 번 포트에 연결 중 ...`);
})

let dataArr = [
  {
  name: "큐시즘",
  email: "kusitms@mmm.mmm",
  description: "HI !"
  },{
    name: "백엔드",
    email: "backend@mmm.mmm",
    description: "studying"
  },{
    name: "세션",
    email: "session@mmm.mmm",
    description: "서버 배포 해보는 중"
  }
]

app.get('/', function (req, res) {
  res.render('index.ejs');
}); 

app.get('/write', function (req, res) {
  res.render('write.ejs');
});

app.get('/list', function (req, res) {
  res.render('list.ejs', { posts : dataArr })
});

app.post('/add', function (req, res) {

  dataArr.push({
    name: req.body.name,
    email: req.body.email,
    description: req.body.description
  })
  res.send('데이터 전송 완료');
});

app.delete('/delete', function(req, res){
  dataArr.pop();
  console.log('삭제 완료');
})

app.get('/dataList', function(req, res){
  res.status(200).json(dataArr);
})
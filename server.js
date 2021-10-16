const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient

app.set('view engine', 'ejs');

var db;
MongoClient.connect('mongodb+srv://id:<password>@cluster0.h0sge.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true }, function (에러, client) {
    if (에러) return console.log(에러)
    db = client.db('todoapp');
    app.listen(8080, function () {
        console.log('listening on 8080')
    });
})

app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', function (req, res) {
    res.sendFile(__dirname + '/write.html')
});

app.get('/list', function (req, res) {
    db.collection('post').find().toArray(function (에러, 결과) {
        console.log(결과);
        res.render('list.ejs', { posts: 결과 });
    })
});

app.post('/add', function (req, res) {
    res.send('전송완료');
    db.collection('post').insertOne({ 제목: req.body.title, 날짜: req.body.date }, function () {
        console.log('저장완료')
    });
});
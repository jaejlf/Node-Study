const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb+srv://id:<password>@cluster0.h0sge.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function (에러, client) {
    if (에러) return console.log(에러)
    app.listen(8080, function () {
        console.log('listening on 8080')
    })
})

app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', function (req, res) {
    res.sendFile(__dirname + '/write.html')
});

app.post('/add', function (req, res) {
    res.send('전송완료');
    console.log(req.body);
});
//import dotenv from 'dotenv'
require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

//multer 세팅 (파일 전송 위한)
let multer = require("multer");
var storage = multer.diskStorage({
    destinationL: function (req, file, cb) {
        cb(null, "./public/image");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
            return callback(new Error("PNG, JPG만 업로드하세요"));
        }
        callback(null, true);
    },
    limits: {
        fileSize: 1024 * 1024,
    },
});
var upload = multer({ storage: storage });

app.use(session({ secret: "비밀코드", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

var db;
MongoClient.connect(process.env.MONGODB_URL, { useUnifiedTopology: true }, function (에러, client) {
    if (에러) return console.log(에러);
    db = client.db("todoapp");
    app.listen(8080, function () {
        console.log("listening on 8080");
    });
});

app.use(express.urlencoded({ extended: true }));

app.get("/", function (요청, 응답) {
    응답.render("index.ejs");
});

app.get("/write", function (요청, 응답) {
    응답.render("write.ejs");
});

app.get("/list", function (요청, 응답) {
    db.collection("post")
        .find()
        .toArray(function (에러, 결과) {
            console.log(결과);
            응답.render("list.ejs", { posts: 결과 });
        });
});

app.post("/add", function (요청, 응답) {
    db.collection("counter").findOne({ name: "게시물 갯수" }, function (에러, 결과) {
        var count = 결과.totalPost;

        db.collection("post").insertOne({ _id: count + 1, 제목: 요청.body.title, 날짜: 요청.body.date }, function (에러, 결과) {
            db.collection("counter").updateOne({ name: "게시물 갯수" }, { $inc: { totalPost: 1 } }, function (에러, 결과) {
                if (에러) return console.log(에러);
                응답.send("전송완료");
            });
        });
    });
});

app.delete("/delete", function (요청, 응답) {
    요청.body._id = parseInt(요청.body._id);
    db.collection("post").deleteOne(요청.body, function (에러, 결과) {
        db.collection("counter").updateOne({ name: "게시물 갯수" }, { $inc: { totalPost: -1 } }, function (에러, 결과) {});
        console.log("삭제완료");
        응답.status(200).send({ message: "성공" });
    });
});

app.get("/detail/:id", function (요청, 응답) {
    db.collection("post").findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과);
        응답.render("detail.ejs", { data: 결과 });
    });
});

app.get("/edit/:id", function (요청, 응답) {
    db.collection("post").findOne({ _id: parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과);
        응답.render("edit.ejs", { post: 결과 });
    });
});

app.put("/edit", function (요청, 응답) {
    db.collection("post").updateOne({ _id: parseInt(요청.body.id) }, { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } }, function (에러, 결과) {
        console.log("수정완료");
        응답.redirect("/list");
    });
});

app.get("/upload", function (요청, 응답) {
    응답.render("upload.ejs");
});

app.post("/upload", upload.single("profileImg"), function (요청, 응답) {
    응답.send("업로드 완료");
});

app.get("/image/:imgName", function (요청, 응답) {
    응답.sendFile(__dirname + "/pulic/image/" + 요청.params.imgName);
});

app.get("/login", function (요청, 응답) {
    응답.render("login.ejs");
});

app.post("/login", passport.authenticate("local", { failureRedirect: "/fail" }), function (요청, 응답) {
    응답.redirect("/");
});

app.get("/mypage", 로그인했니, function (요청, 응답) {
    console.log(요청.user);
    응답.render("mypage.ejs", { 사용자: 요청.user });
});

function 로그인했니(요청, 응답, next) {
    if (요청.user) {
        next();
    } else {
        응답.send("로그인X");
    }
}

passport.use(
    new LocalStrategy(
        {
            usernameField: "id",
            passwordField: "pw",
            session: true,
            passReqToCallback: false,
        },
        function (입력한아이디, 입력한비번, done) {
            //console.log(입력한아이디, 입력한비번);
            db.collection("login").findOne({ id: 입력한아이디 }, function (에러, 결과) {
                if (에러) return done(에러);
                if (!결과) return done(null, false, { message: "존재하지않는 아이디" });
                if (입력한비번 == 결과.pw) {
                    return done(null, 결과);
                } else {
                    return done(null, false, { message: "비번틀렸어요" });
                }
            });
        }
    )
);

//로그인 성공 시 세선 저장 코드
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//마이페이지 접속 시 실행 (user 누군지 찾는)
passport.deserializeUser(function (아이디, done) {
    db.collection("login").findOne({ id: 아이디 }, function (에러, 결과) {
        done(null, 결과);
    });
});
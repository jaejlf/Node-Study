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
MongoClient.connect(process.env.MONGODB_URL, { useUnifiedTopology: true }, function (err, client) {
    if (err) return console.log(err);
    db = client.db("todoapp");
    app.listen(8080, function () {
        console.log("listening on 8080");
    });
});

app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render("index.ejs");
});

app.get("/write", function (req, res) {
    res.render("write.ejs");
});

app.get("/list", function (req, res) {
    db.collection("post")
        .find()
        .toArray(function (err, result) {
            console.log(result);
            res.render("list.ejs", { posts: result });
        });
});

app.post("/add", function (req, res) {
    db.collection("counter").findOne({ name: "게시물 갯수" }, function (err, result) {
        var count = result.totalPost;

        db.collection("post").insertOne({ _id: count + 1, 제목: req.body.title, 날짜: req.body.date }, function (err, result) {
            db.collection("counter").updateOne({ name: "게시물 갯수" }, { $inc: { totalPost: 1 } }, function (err, result) {
                if (err) return console.log(err);
                res.send("전송완료");
            });
        });
    });
});

app.delete("/delete", function (req, res) {
    req.body._id = parseInt(req.body._id);
    db.collection("post").deleteOne(req.body, function (err, result) {
        db.collection("counter").updateOne({ name: "게시물 갯수" }, { $inc: { totalPost: -1 } }, function (err, result) {});
        console.log("삭제완료");
        res.status(200).send({ message: "성공" });
    });
});

app.get("/detail/:id", function (req, res) {
    db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render("detail.ejs", { data: result });
    });
});

app.get("/edit/:id", function (req, res) {
    db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
        console.log(result);
        res.render("edit.ejs", { post: result });
    });
});

app.put("/edit", function (req, res) {
    db.collection("post").updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } }, function (err, result) {
        console.log("수정완료");
        res.redirect("/list");
    });
});

app.get("/upload", function (req, res) {
    res.render("upload.ejs");
});

app.post("/upload", upload.single("profileImg"), function (req, res) {
    res.send("업로드 완료");
});

app.get("/image/:imgName", function (req, res) {
    res.sendFile(__dirname + "/pulic/image/" + req.params.imgName);
});

app.get("/login", function (req, res) {
    res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", { failureRedirect: "/fail" }), function (req, res) {
    res.redirect("/");
});

app.get("/mypage", checkAuth, function (req, res) {
    console.log(req.user);
    res.render("mypage.ejs", { 사용자: req.user });
});

function checkAuth(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send("로그인X");
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
        function (inputID, inputPW, done) {
            //console.log(inputID, inputPW);
            db.collection("login").findOne({ id: inputID }, function (err, result) {
                if (err) return done(err);
                if (!result) return done(null, false, { message: "존재하지않는 id" });
                if (inputPW == result.pw) {
                    return done(null, result);
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
passport.deserializeUser(function (id, done) {
    db.collection("login").findOne({ id: id }, function (err, result) {
        done(null, result);
    });
});
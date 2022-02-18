const express = require('express')
const app = express()

var port = 8080
app.listen(port, () => {
  console.log(`${port} 번 포트에 연결 중 ...`);
})
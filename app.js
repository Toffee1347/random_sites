var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs')

app.get('*', (req, res) => {
    let file
    let url = req.url.split('?')
    if (url[0].endsWith('/index.html')) {
        file = __dirname + '/public' + url[0]
    } 
    else if (url[0].endsWith('/index.html/')) {
        file = __dirname + '/public' + url[0].substring(0, url[0].length - 1)
    } 
    else {
        file = __dirname + '/public' + url[0] + '/index.html'
    }
    fs.readFile(file, function(error, data) {
        if (error) {
            res.statusCode = 404
            res.sendFile(__dirname + '/public/404error.html', 404);
        }
        else {
            res.statusCode = 200
            res.sendFile(file);
        }
    })
  });

io.on('connection', (socket) => {
    socket.on('ttt_start', (data) => {
      console.log(data.game_id);
    });
  });

http.listen(80, () => {
  console.log('listening on *:3000');
});

function print(message) {
    console.log(message)
}
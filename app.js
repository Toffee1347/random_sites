var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs')

app.get('*', (req, res) => {
    let file
    let url = req.url.split('?')
    if (url[0].endsWith('/index.html')) {
        file = './public' + url[0]
    } 
    else if (url[0].endsWith('/index.html/')) {
        file = './public' + url[0].substring(0, url[0].length - 1)
    } 
    else {
        file = './public' + url[0] + '/index.html'
    }
    fs.readFile(file, 'utf8', function(error, data) {
        if (error) {
            res.statusCode = 404
            fs.readFile('./public/404error.html', 'utf8', function(error, data) {
                if (error)  return res.send('<h1>Major Error, Please contact the site owner</h1>')
                res.send(data);
            })
        }
        else {
            res.statusCode = 200
            res.send(data);
        }
    })
  });

io.on('connection', (socket) => {
    socket.on('ttt_start', (data) => {
        eval(`
            game_data.ttt = {
                ${data.game_id} : {
                    grid : [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                    game_status : 'waiting_for_player_one',
                    players_go : null
            }}
        `)
    });
    socket.on('ttt_join', (data) => {
        let query = eval(`game_data.ttt.${data.game_id}.game_status == 'waiting_for_player_one'`)
        let query_two = eval(`game_data.ttt.${data.game_id}.game_status == 'waiting_for_player_two'`)
        if (query) {
            eval(`game_data.ttt.${data.game_id}.game_status = 'waiting_for_player_two'`)
            io.emit('ttt_waiting_for_player_two', {'game_id':data.game_id})
        }
        else if (query_two) {
            eval(`game_data.ttt.${data.game_id}.game_status = 'game_started'`)
            eval(`game_data.ttt.${data.game_id}.players_go = 0`)
            io.emit('ttt_game_start', {'game_id':data.game_id})
        }
    })
  });

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

function print(message) {
    console.log(message)
}

let game_data = {}
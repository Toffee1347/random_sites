var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs')
let data_to_send

app.get('*', (req, res) => {
    let file
    let url = req.url.split('?')[0]
    if (url.endsWith('/options_script.js')) {
        file = './public/options_script.js'
    } 
    else if (url.endsWith('/index.html')) {
        file = './public' + url
    } 
    else if (url.endsWith('/index.html/')) {
        file = './public' + url.substring(0, url.length - 1)
    } 
    else {
        file = './public' + url + '/index.html'
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
                    players_go : null,
                    game_id : '${data.game_id}'
            }}
        `)
    });
    socket.on('ttt_join', (data) => {
        if (typeof(eval(`game_data.ttt.${data.game_id}`)) === 'undefined') {
            socket.emit('ttt_no_game', {'game_id':data.game_id})
            return
        }
        let query = eval(`game_data.ttt.${data.game_id}.game_status == 'waiting_for_player_one'`)
        let query_two = eval(`game_data.ttt.${data.game_id}.game_status == 'waiting_for_player_two'`)
        if (query) {
            eval(`game_data.ttt.${data.game_id}.game_status = 'waiting_for_player_two'`)
            io.emit('ttt_waiting_for_player_two', {'game_id':data.game_id})
        }
        else if (query_two) {
            eval(`game_data.ttt.${data.game_id}.game_status = 'game_started'`)
            eval(`game_data.ttt.${data.game_id}.players_go = 0`)
            eval(`data_to_send = game_data.ttt.${data.game_id}`)
            io.emit('ttt_game_play', {'game_data':data_to_send})
        }
    })
    socket.on('ttt_player_one_move', (data) => {
        eval(`game_data.ttt.${data.game_data.game_id}.grid[${data.move}] = 'X'`)
        eval(`game_data.ttt.${data.game_data.game_id}.players_go++`)
        eval(`data_to_send = game_data.ttt.${data.game_data.game_id}`)
        io.emit('ttt_game_play', {'game_data':data_to_send})
    })
    socket.on('ttt_player_two_move', (data => {
        eval(`game_data.ttt.${data.game_data.game_id}.grid[${data.move}] = 'O'`)
        eval(`game_data.ttt.${data.game_data.game_id}.players_go++`)
        eval(`data_to_send = game_data.ttt.${data.game_data.game_id}`)
        io.emit('ttt_game_play', {'game_data':data_to_send})
    }))
  });

const PORT = process.env.PORT || 80;
http.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

function print(message) {
    console.log(message)
}

let game_data = {'ttt':0}
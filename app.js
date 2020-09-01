var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs')
let data_to_send
let file
let date
let feedback_id
let id
let read_file = true

app.get('*', (req, res) => {
    let url = req.url.split('?')[0]
    if (url.endsWith('/options_script.js')) {
        file = './public/options_script.js'
    } 
    else if (req.url.includes('/feedback/id')) {
        id = req.url.replace('/feedback/id', '')
        for (let i in download_codes) {
            if (id == download_codes[i]) {
                res.download('./public/feedback/json/feedback.json')
                read_file = false
                download_codes[i] = null
            }
        }
    }
    else if (url.endsWith('/index.html')) {
        file = './public' + url
    } 
    else if (url.endsWith('/index.html/')) {
        file = './public' + url.substring(0, url.length - 1)
    } 
    else if (url.includes('.')) {
        file = './public' + url
    } 
    else {
        file = './public' + url + '/index.html'
    }
    if (read_file == true) {
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
                if (file.endsWith('.pck') || file.endsWith('.wasm') ||  file.includes('downloads')) {
                    file = __dirname + '/public' + url
                    res.download(file, function(err) {
                        if (err) console.error(err)
                    })         
                }
                else {
                    res.send(data);
                }
            }
        })
    }
    read_file = true
  });

io.on('connection', (socket) => {
    //ttt events
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
    socket.on('ttt_player_two_move', (data) => {
        eval(`game_data.ttt.${data.game_data.game_id}.grid[${data.move}] = 'O'`)
        eval(`game_data.ttt.${data.game_data.game_id}.players_go++`)
        eval(`data_to_send = game_data.ttt.${data.game_data.game_id}`)
        io.emit('ttt_game_play', {'game_data':data_to_send})
    })
    //jam events
    socket.on('feedback_password', (password) => {
        if (password == 'deviljam') {
            generate_code()
            download_codes.push(feedback_id)
            socket.emit('feedback_correct', feedback_id)
        }
    })
    //bonfire jam events
    socket.on('bonfire_jam_feedback', (feedback_data) => {
        date = new Date().getTime()
        feedback_data.time = date
        fs.readFile('./public/feedback/json/feedback.json', function(err, data) {
            if (err) return console.error(err)
            data = JSON.parse(data)
            data.push(feedback_data)
            feedback_data = data
            fs.writeFile('./public/feedback/json/feedback.json', JSON.stringify(feedback_data), (err) => {
                if (err) console.error(err); return;
            })
        })
    })
  });

const PORT = process.env.PORT || 80;
http.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

let game_data = {'ttt':0}
let download_codes = []

function generate_code() {
    feedback_id = '0'
    while (Number.isInteger(parseInt(feedback_id.substring(0, 1)))) {
        feedback_id = Math.random().toString(36).substring(7)
    }
}
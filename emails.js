const fs = require('fs')
var data_to_send = false
let send_process

module.exports = {
    "emails": {
        "user": (name = '', email = '', feedback = '', time = 0, entry = '') => {
            let data = fs.readFileSync('./emails/user/index.html', 'utf-8')
            data_to_send = data.replace('%-%username%-%', name).replace('%-%usertime%-%', time).replace('%-%tablename%-%', name).replace('%-%useremail%-%', email).replace('%-%userfeedback%-%', feedback).replace('%-%entry%-%', entry)
            return data_to_send;
        },
        "devs": ['<body style="background-color:aqua; padding:40px; font-family: Arial, Helvetica, sans-serif;"><div style="text-align:center; color: black;"><h1>Thanks for your feedback ', '</h1><br><p>Your feedback was recieved from <a href="https://randomsites.herokuapp.com/">https://randomsites.herokuapp.com/</a></p></div></body>']
    }
}
const express = require('express');
const app  = express();
const mysql = require('mysql');

app.set('view engine', 'ejs');
var db_config = {
    host: 'us-cdbr-east-02.cleardb.com',
    user: 'b27ce3b3a6edf8',
    password: '7757e214',
    database: 'heroku_5c1ff8a4829a1b1'
};

var connection;
var data = new Array();
//reconnect to database when disconnected
function handleDisconnect(){
    connection = mysql.createConnection(db_config);
    connection.connect(function(err){
        if(err){
            console.log('error when connecting to db');
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function(err){
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            handleDisconnect();
        } else{
            throw err;
        }

    });
}
handleDisconnect();

connection.query('select * from users', function(error, results, fields){
    if(error) throw error;
    data = results;
    console.log(data);
});


app.get('/history', (req, res) => {
    connection.query('select * from users', function(error, results, fields){
        if(error) throw error;
        data = results;
        console.log(data);
    });
    res.render('mailHistory', {data : data});
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.get('/about', (req, res) => {
    res.render('about');
})


const PORT = process.env.PORT || 5001;

app.listen(PORT, ()=> console.log('Server started'));
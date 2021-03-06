if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const app  = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session')

//app 
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false
}))
app.use(express.static('views'));

// YOUR OWN DATABASE LOGIN CREDENTIALS
var db_config = {
    host: '',
    user: '',
    password: '',
    database: ''
};

var connection;
var data = new Array();

//reconnect to database when disconnected

connection = mysql.createConnection(db_config);
connection.connect();

    


var users;

// get request of /history page 
app.get('/history', (req, res) => {
    // select from the database
    connection.query('select * from data where username = ?', [req.session.username], function(error, results){
        if(error) throw error;
        data = results;
    });
    setTimeout(() => {
        if(req.session.loggedin){
            res.render('mailHistory', {data : data, loggedin: req.session.loggedin, name: req.session.username});
        } else{
            var message = 'You are not Logged in!, please log in before you can view your history'
            res.render('mailHistory', {data: message, loggedin: req.session.loggedin})
        }
        
    }, 500)
    
})

// get request of index page
app.get('/', (req, res) => {
    if(req.session.loggedin){
        res.render('index', {loggedin: req.session.loggedin, name: req.session.username});
    } else {
        res.render('index', {loggedin: req.session.loggedin});
    }

    
})

// get request of login page
app.get('/login', (req, res) => {
    if(req.session.loggedin){
        res.render('index', {loggedin: req.session.loggedin});
    } else {
        res.render('login', {data: req.query.error});
    }
})

//post request to login page
app.post('/login', async(req, res) => {
    //check if username and password matches to connect 
    var username = req.body.username;
    var password = req.body.password;
    var hash;
    var passwordAuth;  
    connection.query('select password from User where username = ?', [username],async function(err, results){
        hash = await results;
        passwordAuth = await bcrypt.compare(password, hash[0].password);
    });

    setTimeout(() => {
        if(passwordAuth){
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/');
        } else {
            res.redirect('/login?error=' + 'incorrect username or password')
        }
    }, 500)
    
})

app.get('/signup', (req, res) => {
    if(req.session.loggedin){
        res.render('index', {loggedin: req.session.loggedin});
    } else {
        res.render('signup', {data : req.query.error});
    }
})

app.post('/signup', async (req,res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.Password, 10);     // hash the password
        // push the email and the password to the database
        console.log(hashedPassword)
        var values = [
            [req.body.username, req.body.Email, hashedPassword, req.body.FName, req.body.LName, req.body.Phone]
        ];
        //if user exists
        var currentUser = new Array();
        connection.query('select * from User where username = ?', [req.body.username],async function(err, results){
            currentUser = await results;
            console.log(currentUser)
        });
        console.log(currentUser)
        setTimeout(() => {
            
            if (currentUser.length === 0){
                console.log('empty')
                connection.query('insert into User (username, email, password, FName, LName, PhoneNum) values ?', [values], function(error, results){
                    if(error) throw error;
                    res.redirect('/login');
                });
            } else {
                res.redirect('/signup?error=' + 'Username already in use');
            }
        }, 500)
        
    } catch {
        res.redirect('/signup');
    }

})

app.get('/about', (req, res) => {
    res.render('about', {loggedin: req.session.loggedin});
})

app.get('/logout', (req,res) => {
    if(req.session.loggedin){
        req.session.loggedin = false;
        req.session.username = ''
    }
    res.render('index', {loggedin : req.session.loggedin})
})



const PORT = process.env.PORT ||5001;

app.listen(PORT, ()=> console.log('Server started'));
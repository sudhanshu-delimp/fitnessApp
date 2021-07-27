const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const app = express();

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

var port = process.env.PORT_NUMBER;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(session({
    name: 'session',
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000, // 1hry
    }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload()); // configure fileupload
const routes = require('./routes');
const api_routes = require('./api_routes');

app.use(routes);
app.use(api_routes);

app.use((err, req, res, next) => {
    console.log(err);
    return res.send('Internal Server Error'+err);
});

app.listen(port, () => console.log('Server is runngin on port '+port));

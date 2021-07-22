const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const routes = require('./routes');
const api_routes = require('./api_routes');
const app = express();
const bodyparser = require('body-parser');
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
        maxAge: 3600 * 1000, // 1hr
    }
}));

app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(routes);
app.use(api_routes);

app.use((err, req, res, next) => {
    console.log(err);
    return res.send('Internal Server Error'+err);
});

app.listen(port, () => console.log('Server is runngin on port '+port));

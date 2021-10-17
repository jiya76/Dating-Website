const express = require('express');
const exphbs = require('express-handlebars');
const res = require('express/lib/response');
const path = require('path');
const app = express();
const port = 3000;

//setup view engine

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about',(req,res) => {
    res.render('about');
});

app.get('/contact',(req,res) => {
    res.render('contact');
});

app.listen(port, () => { 
    console.log(`server is running on port ${port}`); 

});

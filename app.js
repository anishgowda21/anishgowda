const express = require('express');
const udemy = require('./udemy.js');
const yts = require('./yts.js');
const adike = require('./adike.js');
const app = express();


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/udemy',(req,res)=>{
    (async() =>{
        try{
            var data = await udemy(req.query.query);
            res.setHeader('content-type', 'application/json');
            res.status(200).json(data);
        }catch(err){
            res.send(err);
        }
    })()
});

app.get('/yts',(req,res)=>{
    if (req.query.query === undefined){
        res.end('Please provide a query\nExample: /yts?query=hulk');
    }
    else{
        console.log(req.query.query);
    (async()=>{
        try{
            var data = await yts(req.query.query);
            res.setHeader('content-type', 'application/json');
            res.status(200).json(data);
        }catch(err){
            res.send(err);
        }
    })()
    }
});

app.get("/adike",(req,res)=>{
    if (req.query.city_id === undefined || req.query.date === undefined){
        res.end('Please provide a city_id and date\nExample: /areca?city_id=1&date=2020-02');
    }
    else{
        console.log(req.query.city_id,req.query.date);
    (async()=>{
        try{
            var data = await adike(req.query.city_id,req.query.date);
            res.setHeader('content-type', 'application/json');
            res.status(200).json(data);
        }catch(err){
            res.send(err);
        }
    })()
    }
});



const port = process.env.PORT || 5000;
app.listen(port , () => console.log(`Server running on port ${port}`));
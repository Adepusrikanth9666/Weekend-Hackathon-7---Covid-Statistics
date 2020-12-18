const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')


app.get('/totalRecovered', (req, res) => {

    var total=0;

    connection.find().then((people) => {people.map(el=>{
        
        total+=(el.recovered);
        
        
    });
    console.log(total);
    res.send({data: {_id: "total", recovered:total}});

});
})

app.get('/totalActive', (req, res) => {

    var total=0;

    connection.find().then((people) => {people.map(el=>{
        
        total+=(el.infected-el.recovered);
        
        
    });
    console.log(total);
    res.send({data: {_id: "total", active:total}});

});
})


app.get('/totalDeath', (req, res) => {

    var total=0;

    connection.find().then((people) => {people.map(el=>{
        
        total+=(el.death);
        
        
    });
    console.log(total);
    res.send({data: {_id: "total", death:total}});

});
})

app.get('/hotspotStates', (req, res) => {

    var total=[];

    connection.find().then((people) => {people.filter(el=>{

        if((((el.infected-el.recovered)/el.infected))>0.1){
            total.push({state: el.state, rate: ((el.infected-el.recovered)/el.infected).toFixed(5)});
        }
        
      
        
        
    });
    // console.log(total);
    res.send({data: total});
   

});
});


app.get('/healthyStates', (req, res) => {

    var total=[];

    connection.find().then((people) => {people.filter(el=>{

        if((((el.death)/el.infected))<0.005){
            total.push({state: el.state, mortality: (((el.death)/el.infected)).toFixed(5)});
            console.log((((el.death)/el.infected)));
          console.log(  ((((el.death)/el.infected)) ).toFixed(5))
        }
        
      
          
        
    });
    // console.log(total);
    res.send({data: total});
   

});
});








app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require("./connector");

app.get("/totalRecovered", (req, res) => {
  connection.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$recovered"
          }
        }
      }
    ])
    .then((result, error) => {
      let totalValue = {
        data: {
          _id: "total",
          recovered: result[0].total
        }
      };
      if (!error) {
        res.send(totalValue);
      }
    });

  //     var total=0;

  //     connection.find().then((people) => {people.map(el=>{

  //         total+=(el.recovered);

  //     });
  //     console.log(total);
  //     res.send({data: {_id: "total", recovered:total}});

  // });
});

app.get("/totalActive", (req, res) => {
  //     var total=0;

  //     connection.find().then((people) => {people.map(el=>{

  //         total+=(el.infected-el.recovered);

  //     });
  //     console.log(total);
  //     res.send({data: {_id: "total", active:total}});

  // });

  connection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $substract: ["$infected", "$ recovered"] } }
        }
      }
    ])
    .then((result, error) => {
      let totalValue = {
        data: {
          _id: "total",
          active: result[0].total
        }
      };
      if (!error) {
        res.send(totalValue);
      }
    });
});

app.get("/totalDeath", (req, res) => {
  //     var total=0;

  //     connection.find().then((people) => {people.map(el=>{

  //         total+=(el.death);

  //     });
  //     console.log(total);
  //     res.send({data: {_id: "total", death:total}});

  // });

  connection.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: "$death"
          }
        }
      }
    ])
    .then((result, error) => {
      let totalValue = {
        data: { _id: "total", death: result[0].total }
      };
      if (!error) {
        res.send(totalValue);
      }
    });
});

app.get("/hotspotStates", (req, res) => {
  //     var total=[];

  //     connection.find().then((people) => {people.filter(el=>{

  //         if((((el.infected-el.recovered)/el.infected))>0.1){
  //             total.push({state: el.state, rate: ((el.infected-el.recovered)/el.infected).toFixed(5)});
  //         }

  //     });
  //     // console.log(total);
  //     res.send({data: total});

  // });

  connection.aggregate([
      {
        $project: {
          state: 1,
          rate: {
            $round: [
              {
                $divide: [
                  {
                    $substract: ["$infected", "$recovered"]
                  },
                  "$infected"
                ]
              },
              5
            ]
          }
        }
      },
      {
        $match: {
          rate: {
            $gt: 0.1
          }
        }
      }
    ])
    .then((result, error) => {
      if (!error) {
        res.send({ data: result });
      }
    });
});

app.get("/healthyStates", (req, res) => {
  //     var total=[];

  //     connection.find().then((people) => {people.filter(el=>{

  //         if((((el.death)/el.infected))<0.005){
  //             total.push({state: el.state, mortality: (((el.death)/el.infected)).toFixed(5)});
  //             console.log((((el.death)/el.infected)));
  //           console.log(((((el.death)/el.infected))).toFixed(5))
  //           $round: [ "$value", 1 ]
  //         }

  //     });
  //     // console.log(total);
  //     res.send({data: total});

  // });

  connection.aggregate([
      {
        $project: {
          state: 1,
          mortality: {
            $round: [
              {
                $divide: ["$death", "$infected"]
              },
              5
            ]
          }
        }
      },
      {
        $match: {
          mortality: { $lt: 0.005 }
        }
      }
    ])
    .then((result, error) => {
      if (!error) {
        res.send({ data: result });
      }
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;

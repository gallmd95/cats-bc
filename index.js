var mysql      = require('mysql');
const express = require('express')

var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : 'cat',
  password : process.env.DB_PASSWORD,
  database : 'cats',
  port     : process.env.DB_PORT
});
connection.connect();

const app = express()
app.use(express.json()) 
 

/**
 * Saves cat to the database. 
 */ 
app.post('/cat/register', function (req, res) {
        if (req.body.password.length < 8){ 
            return res.send("Password must be at least 8 characters\n") 
        }
        connection.query(
            'INSERT INTO cats' 
          + '(`create_date`, `birthdate`, `breed`, `image_url`, `last_seen_at`, `name`, `password`, `username`, `weight`)' 
          + 'VALUES (null,       ?,          ?,        ?,             null,        ?  , SHA2(?, 256),    ?,         ?)', 
          [ req.body.birthdate,
            req.body.breed,
            req.body.imageUrl,
            req.body.name,
            req.body.password,
            req.body.username,
            req.body.weight
          ],
          function (error) {
            if (error) { return res.send(error.sqlMessage); }
            else { res.send("Cat registered!\n"); }
          })
});


app.post('/cat/login', function (req, res) {
    connection.query('SELECT password FROM cats WHERE `username`=? LIMIT 1', [req.body.username], function(error, results, fields){
        if (results.length < 1) { res.send("No such username.\n"); }
        else {
            //get the sha256 of this pass and compare it to the one from query
            username = req.body.username;
            connection.query('SELECT SHA2(?, 256) AS hashed', [req.body.password], function(error, results){
                if ( error ) { res.send(error.sqlMessage); }
                else {
                    connection.query('SELECT SHA2(CONCAT(`username`, " ", `password`, "salty salt"), 256) AS token FROM cats WHERE `username`=? AND `password`=? LIMIT 1', 
                        [username, results[0].hashed],
                        function(error, results){
                            if ( error ) { res.send(error.sqlMessage); }
                            else {
                                res.json({'Token': results[0].token})
                            }
                    })
                }
            })
        }
    })
})

app.post('/cats', function (req, res) {
    whereClause = "";
    params = [];
    first = true;
    if (req.body.id || req.body.name || req.body.username){
        whereClause = "WHERE ";
    }
    if (req.body.id) {
        whereClause = whereClause.concat("`id`=? "); 
        first = false;
        params.push(req.body.id)
    }
    if (req.body.name) {
        whereClause = whereClause.concat((first ? "" : "AND ") + "`name`=? "); 
        first = false;
        params.push(req.body.name)
    }
    if (req.body.username) {
        whereClause = whereClause.concat((first ? "" : "AND ") + "`username`=? "); 
        first = false;
        params.push(req.body.username)
    }
    q = 'SELECT `username`, `breed`, `birthdate`, `id`, `image_url`, `name` FROM cats ' + whereClause + ' ORDER BY `last_seen_at` DESC',
    connection.query(q,
      params,
      function(error, results){
          if (error) { res.send(error.sqlMessage);}
          else if (results.length == 0) { res.send("Invalid search criteria.\n");}
          else {
              approvedUsers = new Set();
              catInfo = cat => {
                  return Promise.resolve({
                          'birthdate': cat.birthdate, 
                          'breed': cat.breed, 
                          'username': cat.username, 
                          'id': cat.id,
                          'imageUrl': cat.image_url,
                          'name': cat.name
                        });
                    };
               Promise.all(results.map(cat => {
                  return new Promise((resolve, reject)=> {
                    if (approvedUsers.has(cat.username)){
                        resolve(cat);
                    }
                    else {
                        connection.query('SELECT SHA2(CONCAT(`username`, " ", `password`, "salty salt"), 256) AS token FROM cats WHERE `username`=? LIMIT 1', 
                            [cat.username],
                            function(error, results){
                                if ( error ) { reject(error.sqlMessage); }
                                else {
                                    if (results[0].token === req.get('auth-token')){
                                        approvedUsers.add(cat.username);
                                        resolve(catInfo(cat));
                                    } else {     
                                        reject("Invalid authToken.");
                                    }
                                }
                        })
                    }
                  })
              }))
              .then(arr=>{
                  if (arr.length === 0){
                      res.send("Invalid search criteria.")
                  } else {
                    res.send(arr);
                  }
              }, (msg)=>res.send(msg));
          }
      }
    )
})

app.post('/cats/random', function (req, res) {
    connection.query('SELECT `breed`, `image_url`, `name` FROM cats ORDER BY RAND() LIMIT 1',[], function(error, results){
        if (error) { res.send(error.sqlMessage);}
        else if (results.length === 0){
            res.send("Sorry no cats are available at this time.");
        }
        else {
            res.json(results[0])
        } 
    })
})

app.listen(3000)
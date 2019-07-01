var mysql      = require('mysql');
const express = require('express')

var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : 'cat',
  password : process.env.DB_PASSWORD,
  database : 'cats'
});
connection.connect();

const app = express()
app.use(express.json()) 
 

/**
 * /cat/register
 * Header: browser info
* Body:
*  birthdate:Date?
*  breed: String?
*  imageUrl: String?
*  name: String
*  password: String
*  username: String
*  weight: Float
* Save the cat in a database:
*  addedAt: Date
*  breed: String?
*  birthdate:Date?
*  id: Int
*  imageUrl: String?
*  lastSeenAt: Date
*  name: String
*  password: String
*  username: String
*  weight: Float
 */
app.post('/cat/register', function (req, res) {
    console.log(req.body.birthdate)
    return connection.query('INSERT INTO cats (`birthdate`, `breed`, `image_url`, `lastSeenAt`, `name`, `password`, `username`, `weight`) VALUES (?, ?, ?, ?, SHA2(?, 256), ?, ?)', 
      [ req.body.birthdate,
        req.body.breed,
        req.body.imageUrl,
        req.body.name,
        req.body.password,
        req.body.username,
        req.body.weight
      ],
      function (error, results, fields) {
        console.log(error)
        console.log(results)
        console.log(fields)
        return true
      });
})

app.get('/cat/login', function (req, res) {
    res.send('Hello World')
})

app.get('/cats', function (req, res) {
    res.send('Hello World')
})

app.get('/cats/random', function (req, res) {
    res.send('Hello World')
})

app.listen(3000)

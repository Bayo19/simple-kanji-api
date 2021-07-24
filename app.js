const express = require('express')
const app = express()
const mysql = require('mysql2')

require('dotenv').config()

app.use(express.urlencoded({extended: true}))
app.use(express.json())

const port = process.env.PORT || 5000
const env_host = process.env.HOST
const env_user = process.env.USER
const env_password = process.env.PASSWORD

// MySQL

const pool = mysql.createPool({
    connectionLimit : 10,
    host            : env_host,
    user            : env_user,
    password        : env_password,
    database        : 'kanji_db'
})

// Get kanji by JLPT Level

app.get('/kanji/level/:n_level', (req, res) => {
    
        pool.getConnection((err, connection) => {
            if(err) throw err
            console.log(`connected as id ${connection.threadId}`)
    
            connection.query(`SELECT * from kanji_table WHERE n_level = ?`, [req.params.n_level], (err, rows) => {
                connection.release()
                if(!err) {
                    res.send(rows.map(function(a){
                        return ({
                            id: a.kanji,
                            meanings: a.meanings,
                            kun_readings: a.kun_readings,
                            on_readings: a.on_readings,
                            jlpt_level: a.n_level
                        })
                    }))
                } else { 
                    res.send('something wrong')
                }
            })
    
        })
    })


// Get kanji by ID
app.get('/kanji/:kanji', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query(`SELECT * from kanji_table WHERE kanji = ?`, [req.params.kanji], (err, rows) => {
            connection.release() // return connection to pool
    
            if(!err) {
                res.send({
                    id: rows[0].kanji,
                    meanings: rows[0].meanings,
                    kun_readings: rows[0].kun_readings,
                    on_readings: rows[0].on_readings,
                    jlpt_level: rows[0].jlpt_level
                })
 
            } else {
                console.log(err)
            }
        })
    })
})

// Get all kanji
app.get('/kanji', (req,res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        connection.query('SELECT * from kanji_table', (err, rows) => {
            connection.release() // return connection to pool
    
            if(!err) {
                res.send(rows.map(function(a){
                    return ({
                        id: a.kanji,
                        meanings: a.meanings,
                        kun_readings: a.kun_readings,
                        on_readings: a.on_readings,
                        n_level: a.n_level
                    })
                }))
                
            } else {
                console.log(err)
            }
        })
    
    })
})

// Listen on environment PORT or 5000

app.listen(port, () => {
    console.log(`we are listening to ${port}`)
})
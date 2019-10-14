require('dotenv').config()

const { MONGODB_URL, PORT } = process.env
const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb')

let app = express()

MongoClient.connect(MONGODB_URL, (err, db) =>{
    if(err){ throw err}

    let dbo = db.db('LinkShortener')

    app.use(bodyParser.json())

    app.get('/list', (req, res) => {
        dbo.collection('url').find({}).toArray((err, results) => {
            let output = '<h1>Shortened '
            results.forEach((result => {
                const {id, url} = result
                output +=`<li><a href="localhost:3000/${id}">${id}</a></li>`
            }))
            res.send(output)
        })
    })

    app.get('/:id', (req, res) => {
        const {id} = req.params
        dbo.collection('url').findOne({id}, (err, result) =>{
            if(!err && result){
                res.redirect(result.url)
            }
            else{
                res.send(err)
            }
        })
    })

    app.post('/create', (req, res) => {
        // {id: 'test', url: 'https://google.com'}
        
        const {id, url} = req.body
        if(id && url) {
            dbo.collection('url').insertOne({id, url}, (err, results) => {
                if(!err){
                    res.status(200).json("Success")
                }
                else{
                    res.status(400).json("Failure")
                }
            })
            }
        else{
            res.status(401).json("Missing Parameters")
        }
    })

    app.delete('/:id', (req, res) => {
        const {id} = req.params
        dbo.collection('url').deleteOne({id}, (err, result) => {
            if(!err){
                res.status(200).json(result)
            }
            else{
                res.status(400).json("Failure")
            }
        })
    })


    app.listen(PORT, (_) => {
        console.log(`Listening on port: ${PORT}`)
    })
})

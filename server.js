const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000;
const path = require("path")
const bodyParser = require("body-parser")
const hbs = require('express-handlebars')
const formidable = require('formidable');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('static'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
}))

let table = []
let id = 1

app.get("/", function (req, res) {
    res.render('filemanager.hbs')
})
app.get("/filemanager", function (req, res) {
    res.render('filemanager.hbs', { files: table })
})
app.post("/handleUpload", function (req, res) {
    res.setHeader('content-type', 'application/json')
    const form = formidable({})
    form.keepExtensions = true
    form.multiples = true
    form.uploadDir = __dirname + '/static/upload/'
    form.parse(req, function (err, fields, files) {
        if (files.imagetoupload[1] == undefined)
            pushFile(files.imagetoupload)
        else
            for (let file of files.imagetoupload)
                pushFile(file)
    })
    res.redirect("/filemanager")
})
app.get("/upload", function (req, res) {
    res.render('upload.hbs')
})
app.get("/reset", function (req, res) {
    table = []
    res.redirect("/filemanager")
})
app.get("/delete", function (req, res) {
    table = table.filter(el => el.id != req.query.id)
    res.redirect("/filemanager")
})
app.get("/download", function (req, res) {
    let file = table.filter(el => el.id == req.query.id)[0]
    let src = "/" + file.path.split("").splice(4).join("")
    res.download(path.join(__dirname + src))
})
app.get("/info", function (req, res) {
    let file = table.filter(el => el.id == req.query.id)[0]
    console.log(file)
    res.render('info.hbs', file)
})

function pushFile(file) {
    let fileType = file.type.split("/").splice(-1)
    if (fileType != "jpg" && fileType != "png" && fileType != "pdf" && fileType != "txt")
        fileType = "other"
    table.push({
        id: id++,
        path: "app/" + file.path.split("\\").slice(-3).join("/"),
        name: file.name,
        size: file.size,
        type: file.type,
        img: fileType + ".png",
        saveDate: Date.now()
    })
}

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})
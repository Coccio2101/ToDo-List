const express = require("express")
const bodyParser = require("body-parser")
/* const date = require(__dirname + "/date.js") */
const mongoose = require("mongoose")

const app = express()

/* const items = ["Buy Food", "Cook Food", "Eat Food"]
const itemWork = [] */

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set("view engine", "ejs")

// database creation
url = "mongodb://127.0.0.1:27017/todolistDB"


// create a new item schema
const itemSchema = new mongoose.Schema({
    name: String
})

// create a mongoose model
const Item = mongoose.model("Item", itemSchema)

// create some records
const item1 = new Item({
    name: "Welcome to your todolist!"
})
const item2 = new Item({
    name: "Hit the + button to add a new item"
})
const item3 = new Item({
    name: "<-- Hit this to delete an item"
})

async function databaseConnection() {
    await mongoose.connect(url)
    console.log("Connection with database established...")
}

async function databaseInsert(records) {
    await Item.create(records)
    console.log("item has been inserted!")
}

async function databaseRead(filter) {
    const query = await Item.find(filter).exec()

    const queryList = []

    query.forEach((record) => {
        queryList.push(record)
    })

    return queryList
}

async function main () {
    // We need to wait the connection from the database before
    // doing operation with it
    await databaseConnection()
    let records = [item1, item2, item3]
    databaseInsert(records)

    // read from the database
    filter = {}
    const items = await databaseRead(filter)

    app.get("/", (req, res) => {
        /* const day = date.getDate() */
        res.render("list", {listTipe: "Today", newListItem: items})
    })
    
    app.get("/work", (req, res) => {
        res.render("list", {listTipe: "Work", newListItem: itemWork})
    })
    
    app.post("/", (req, res) => {
        
        const item = req.body.newItem
    
        if (req.body.list === "Work") {
            itemWork.push(item)
            res.redirect("/work")
        } else {
            items.push(item)
            res.redirect(`/`)
        }
    })
    
    app.get("/about", (req, res) => {
        res.render("about")
    })
    
    app.listen(3000, () => {
        console.log("Server is listening on port 3000")
    })
}

main()
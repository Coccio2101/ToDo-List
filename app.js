const express = require("express")
const bodyParser = require("body-parser")
/* const date = require(__dirname + "/date.js") */
const mongoose = require("mongoose")
const _ = require("lodash")

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

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

// create a mongoose model
const Item = mongoose.model("Item", itemSchema)
const List = mongoose.model("List", listSchema)

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

async function databaseInsert(records) {
    await Item.create(records)
    console.log("item has been inserted!")
}

async function main () {
    // We need to wait the connection from the database before
    // doing operation with it
    await mongoose.connect(url)
    console.log("Connection with database established...")

    // GET REQUESTES
    app.get("/", async function(req, res) {
        /* const day = date.getDate() */

        // read from the database
        filter = {}
        const query = await Item.find(filter).exec()
        const items = []
        query.forEach((record) => {
            items.push(record)
        })

        if(items.length === 0) {
            await databaseInsert([item1, item2, item3])
            res.redirect("/")
        } else {
            res.render("list", {listTipe: "Today", newListItem: items})
        }
    })

    app.get("/:customListTitle", async function(req, res){
        const customListTitle = _.capitalize(req.params.customListTitle)

        const list = new List({
            name: customListTitle,
            items: [item1, item2, item3]
        })

        const query = await List.findOne({name: customListTitle}).exec()
        if(query) {
            // Show an existing list
            res.render("list", {listTipe: customListTitle, newListItem: query.items})
        } else {
            // Create a new list
            list.save()
            res.redirect("/" + customListTitle)
        }
    })

    app.get("/about", (req, res) => {
        res.render("about")
    })
    
    // POST REQUESTES
    app.post("/", async function(req, res){
        
        const itemName = req.body.newItem
        const listName = req.body.list

        // Create a new item based on the item model
        const item = new Item({
            name: itemName
        })

        if (listName === "Today") {
            item.save()    
            res.redirect("/")
        } else {
            // find the list and push the new item
            const filter = {name: listName}
            const query = await List.findOne(filter).exec()
            const itemList = query.items
            itemList.push(item)

            // update the record with the new item
            await List.updateOne(filter, {items: itemList})
            res.redirect("/" + listName)
        }
    })
    
    app.post("/delete", async function(req, res){
        const checkedItemId = req.body.checkbox
        const listName = req.body.listName
        const itemName = req.body.itemName

        if (listName === "Today") {
            await Item.findByIdAndRemove(checkedItemId)
            res.redirect("/")
        } else {
            // Maybe there is a better way but for now it works
            const query = await List.findOne({name: listName}).exec()

            for (let i = 0; i < query.items.length; i++) {
                if(query.items[i].name === itemName) {
                    query.items.splice(i, 1)
                }
            }

            const response = await List.updateOne({name: listName}, {items: query.items})
            console.log(response)
            res.redirect("/" + listName)      
        }  
    })
    
    // APP LISTEN
    app.listen(3000, () => {
        console.log("Server is listening on port 3000")
    })
}

main()
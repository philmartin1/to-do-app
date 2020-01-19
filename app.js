const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

app.listen(3000, function () {
    console.log("Server running on port 3000");
});

app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/toDoApp");

// ------------ SCHEMAS ------------- //
const toDoListSchema = new mongoose.Schema({
    listTitle: String,
    toDos: [
        [String, [String]]
    ]
});

/*  // ------ possible nested object todo schema --------- //
const firstList = {
    listTitle: "General",
    toDos: [{
        toDo: "Create app",
        subToDos: ["Make it work", "...really well!", "then relax"]
    }, {
        toDo: "Test to do",
        subToDos: ["test sub todo", "test sub todo 2"]
    }]
}
*/

const ToDoList = mongoose.model("ToDoList", toDoListSchema)

const welcomeList = new ToDoList({
    listTitle: "Welcome",
    toDos: [
        ["Welcome to your new to do list!", []],
        ["You can record all your tasks here", ["...and add subtasks too."]],
        ["Get started by adding your first item above", ["Then create custom lists from the menu", "There are some default lists to help get you started"]]
    ]
});

welcomeList.save();

const generalList = {
    listTitle: "General",
    toDos: []
}

app.get("/", function (req, res) {
    res.render("list", {
        listTitle: welcomeList.listTitle,
        toDos: welcomeList.toDos,
    });
});

app.get("/general", function (req, res) {
    res.render("list", {
        listTitle: generalList.listTitle,
        toDos: generalList.toDos,
    });
});
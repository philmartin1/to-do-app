const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.listen(3000, function () {
    console.log("Server running on port 3000");
});

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/toDoApp", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to database")
});

const subtaskSchema = new mongoose.Schema({
    subtask: String,
    isComplete: { type: Boolean, default: false },
    dateEdited: { type: Date, default: new Date() }
})

const toDoSchema = new mongoose.Schema({
    toDo: String,
    isComplete: { type: Boolean, default: false },
    dateEdited: { type: Date, default: new Date() },
    subtasks: [subtaskSchema]
})

const toDoListSchema = new mongoose.Schema({
    listTitle: String,
    dateEdited: { type: Date, default: new Date() },
    toDos: [toDoSchema]
});

const ToDoList = mongoose.model("ToDoList", toDoListSchema)

let menu = [];
function updateMenu() {
    ToDoList.find({}, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            menu = found.sort(function (a, b) {
                if (b.dateEdited < a.dateEdited) { return -1 };
                if (b.dateEdited > a.dateEdited) { return 1 };
            }).map(function (item) {
                return item.listTitle;
            })
        }
    });
}

app.get("/", function (req, res) {
    updateMenu();
    ToDoList.findOne().sort({ dateEdited: -1 }).exec(function (err, found) {
        if (err) {
            console.log(err)
        } else if (!found) {
            res.redirect("/welcome");
        } else {
            let title = found.listTitle;
            let list = found.toDos.sort(function (a, b) {
                if (b.isComplete > a.isComplete) { return -1 };
                if (b.isComplete < a.isComplete) { return 1 };
                if (b.dateEdited < a.dateEdited) { return -1 };
                if (b.dateEdited > a.dateEdited) { return 1 };
            });
            res.render("list", {
                menu: menu,
                title: title,
                list: list
            })
        }
    })
});

app.get("/welcome", function (req, res) {
    updateMenu();
    ToDoList.findOne({ listTitle: "WELCOME" }, function (err, found) {
        if (err) {
            console.log(err)
        } else if (!found) {
            let welcomeList = new ToDoList({
                listTitle: "WELCOME",
                toDos: [
                    {
                        toDo: "Welcome to your new to do list!",
                    },
                    {
                        toDo: "You can record all your tasks here",
                        subtasks: [
                            {
                                subtask: "...and add subtasks too.",
                            }
                        ]
                    },
                    {
                        toDo: "Get started by adding your first item above",
                    },
                    {
                        toDo: "Create new lists from the menu",
                        subtasks: [
                            {
                                subtask: "Rename and delete lists in the list heading"
                            }
                        ]
                    }]
            });
            welcomeList.save();
            setTimeout(() => {
                updateMenu();
            }, 100);
            setTimeout(() => {
                res.render("list", {
                    menu: menu,
                    title: welcomeList.listTitle,
                    list: welcomeList.toDos.sort(function (a, b) {
                        if (b.isComplete > a.isComplete) { return -1 };
                        if (b.isComplete < a.isComplete) { return 1 };
                        if (b.dateEdited < a.dateEdited) { return -1 };
                        if (b.dateEdited > a.dateEdited) { return 1 };
                    })
                }
                );
            }, 100);
        } else {
            let title = found.listTitle;
            let list = found.toDos.sort(function (a, b) {
                if (b.isComplete > a.isComplete) { return -1 };
                if (b.isComplete < a.isComplete) { return 1 };
                if (b.dateEdited < a.dateEdited) { return -1 };
                if (b.dateEdited > a.dateEdited) { return 1 };
            });
            updateMenu();
            res.render("list", {
                menu: menu,
                title: title,
                list: list
            }
            );
        }
    });
});

app.post("/new-list", function (req, res) {
    let newListTitle = req.body.newList.toUpperCase();
    ToDoList.findOne({ listTitle: newListTitle }, function (err, found) {
        if (err) {
            console.log(err)
        } else if (!found) {
            let newList = new ToDoList({
                listTitle: newListTitle,
                dateEdited: new Date()
            });
            newList.save();
        }
    });
    setTimeout(() => {
        res.redirect(`/${newListTitle}`)
    }, 100);
});

app.get("/:listTitle", function (req, res) {
    updateMenu();
    let listTitle = req.params.listTitle.toUpperCase();
    ToDoList.findOne({ listTitle: listTitle }, function (err, found) {
        if (err) {
            console.log(err)
        } else {
            let title = found.listTitle;
            let list = found.toDos.sort(function (a, b) {
                if (b.isComplete > a.isComplete) { return -1 };
                if (b.isComplete < a.isComplete) { return 1 };
                if (b.dateEdited < a.dateEdited) { return -1 };
                if (b.dateEdited > a.dateEdited) { return 1 };
            });
            updateMenu();
            res.render("list", {
                menu: menu,
                title: title,
                list: list
            }
            )
        }
    });
});

app.post("/:listTitle/add", function (req, res) {
    let listTitle = req.params.listTitle.toUpperCase();
    let newToDo = req.body.newItem;
    let query = { listTitle: listTitle };

    ToDoList.findOne(query, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            found.toDos.push({ toDo: newToDo, dateEdited: new Date() })
            let newToDos = found.toDos
            let update = { toDos: newToDos }

            ToDoList.findOneAndUpdate(query, update, function (err, item) {
                if (err) {
                    console.log(err)
                }
            })
        }
    })
    setTimeout(() => { // setTimeout is to avoid reload before item saved
        res.redirect(`/${listTitle}`)
    }, 100);
});

app.post("/:listTitle/update", function (req, res) {
    let listTitle = req.params.listTitle.toUpperCase();
    let updatedToDo = req.body.updatedToDo;
    let query = { listTitle: listTitle };
    let toDoId = req.body.toDoId;
    let newSubtask = req.body.newSubtask;

    if (newSubtask) {
        ToDoList.findOne(query, function (err, found) {
            if (err) {
                console.log(err);
            } else {
                let toDos = found.toDos;
                toDos.forEach(toDo => {
                    if (toDo._id == toDoId) {
                        toDo.subtasks.push({ subtask: newSubtask })
                    }
                })
                found.toDos = toDos;
                let update = { toDos: found.toDos };
                ToDoList.findOneAndUpdate(query, update, function (err, item) {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        })
    } else if (req.body.toDoToggleComplete) {
        ToDoList.findOne(query, function (err, found) {
            if (err) {
                console.log(err);
            } else {
                let toDos = found.toDos;
                toDos.forEach(toDo => {
                    if (toDo._id == toDoId) {
                        if (toDo.isComplete == false) {
                            toDo.isComplete = true;
                            toDo.dateEdited = new Date();
                            if (toDo.subtasks.length > 0) {
                                toDo.subtasks.forEach(subtask => {
                                    subtask.isComplete = true;
                                    subtask.dateEdited = new Date();
                                })
                            }
                        } else {
                            toDo.isComplete = false;
                            toDo.dateEdited = new Date();
                            if (toDo.subtasks.length > 0) {
                                toDo.subtasks.forEach(subtask => {
                                    subtask.isComplete = false;
                                    subtask.dateEdited = new Date();
                                })
                            }
                        }
                    }
                })
                found.toDos = toDos;
                let update = { toDos: found.toDos };
                ToDoList.findOneAndUpdate(query, update, function (err, item) {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        })
    } else if (req.body.subtaskToggleComplete) {
        let subtaskId = req.body.subtaskToggleComplete;
        ToDoList.findOne(query, function (err, found) {
            if (err) {
                console.log(err);
            } else {
                let toDos = found.toDos;
                toDos.forEach(toDo => {
                    if (toDo._id == toDoId) {
                        let subtasks = toDo.subtasks;
                        subtasks.forEach(subtask => {
                            if (subtask._id == subtaskId) {
                                if (subtask.isComplete == false) {
                                    subtask.isComplete = true;
                                    subtask.dateEdited = new Date();
                                } else {
                                    subtask.isComplete = false;
                                    subtask.dateEdited = new Date();
                                    if (toDo.isComplete == true) {
                                        toDo.isComplete = false;
                                        toDo.dateEdited = new Date();
                                    }
                                }
                            }
                        })
                    }
                })
                found.toDos = toDos;
                let update = { toDos: found.toDos };
                ToDoList.findOneAndUpdate(query, update, function (err, item) {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        });
    } else {
        ToDoList.findOne(query, function (err, found) {
            let updatedToDo = req.body.updatedToDo
            if (err) {
                console.log(err);
            } else {
                let toDos = found.toDos;
                toDos.forEach(toDo => {
                    if (toDo._id == toDoId) {
                        if (toDo.toDo == updatedToDo) {
                            let subtaskId = req.body.subtaskId;
                            ToDoList.findOne(query, function (err, found) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    let toDos = found.toDos;
                                    toDos.forEach(toDo => {
                                        if (toDo._id == toDoId) {
                                            let subtasks = toDo.subtasks;
                                            subtasks.forEach(subtask => {
                                                if (typeof subtaskId == "string") {
                                                    if (subtask._id == subtaskId) {
                                                        subtask.subtask = req.body.updatedSubtask;
                                                        subtask.dateEdited = new Date();
                                                    }
                                                } else {
                                                    for (i = 0; i < subtaskId.length; i++) {
                                                        if (subtask._id == subtaskId[i]) {
                                                            subtask.subtask = req.body.updatedSubtask[i];
                                                            subtask.dateEdited = new Date();
                                                        }
                                                    }
                                                }
                                            })
                                        }
                                    })
                                    found.toDos = toDos;
                                    let update = { toDos: found.toDos };
                                    ToDoList.findOneAndUpdate(query, update, function (err, item) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    })
                                }
                            });
                        } else {
                            toDo.toDo = updatedToDo;
                            toDo.dateEdited = new Date()
                        }
                        found.toDos = toDos;
                        let update = { toDos: found.toDos };
                        ToDoList.findOneAndUpdate(query, update, function (err, item) {
                            if (err) {
                                console.log(err);
                            }
                        })

                    }
                })
            }
        })
    }
    setTimeout(() => {
        res.redirect(`/${listTitle}`)
    }, 100);
});

app.post("/:listTitle/edit-title", function (req, res) {
    let currentList = req.params.listTitle;
    let newTitle = req.body.newTitle.toUpperCase();

    let query = { listTitle: currentList };
    let update = { listTitle: newTitle };
    ToDoList.findOneAndUpdate(query, update, function (err) {
        if (err) {
            console.log(err);

        }
    })
    res.redirect(`/${newTitle}`)
});

app.get("/:listTitle/delete-list", function (req, res) {
    let currentList = req.params.listTitle;

    let query = { listTitle: currentList };
    ToDoList.findOneAndDelete(query, function (err) {
        if (err) {
            console.log(err);
        }
    })
    res.redirect("/")
});

app.get("/:listTitle/delete-todo/:toDoId/:subtaskId", function (req, res) {
    let listTitle = req.params.listTitle.toUpperCase();
    let toDoId = req.params.toDoId;
    let subtaskId = req.params.subtaskId;
    let query = { listTitle: listTitle };

    ToDoList.findOne(query, function (err, found) {
        if (err) {
            console.log(err);
        } else if (subtaskId == 0) {
            found.toDos = found.toDos.filter(toDo => {
                if (toDo._id != toDoId) {
                    return true
                }
            });
            let update = { toDos: found.toDos };
            ToDoList.findOneAndUpdate(query, update, function (err, item) {
                if (err) {
                    console.log(err);
                }
            })
        } else {
            let toDos = found.toDos;
            toDos.forEach(toDo => {
                if (toDo._id == toDoId) {
                    let subtasks = toDo.subtasks;
                    subtasks = subtasks.filter(subtask => {
                        if (subtask._id != subtaskId) {
                            return true
                        }
                    });
                    toDo.subtasks = subtasks;
                }
                let update = { toDos: found.toDos };
                ToDoList.findOneAndUpdate(query, update, function (err, item) {
                    if (err) {
                        console.log(err);
                    }
                })
            })
        }
    })
    setTimeout(() => {
        res.redirect(`/${listTitle}`)
    }, 100);
});
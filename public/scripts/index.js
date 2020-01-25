const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");
const firstNavItem = document.querySelector(".nav-list li")

menu.addEventListener("click", function () {
    if (!nav.style.display || nav.style.display == "none") {
        nav.style.display = "initial";
    } else {
        nav.style.display = "none";
    }
});



const listTitleStatic = document.querySelector(".list-title--static");
const listTitleEdit = document.querySelector(".list-title--edit");
const titleEdit = document.querySelector(".title-icon-edit");
const editTitle = document.querySelector(".list-title--edit-heading");

titleEdit.addEventListener("click", function () {
    if (listTitleStatic.style.display != "none") {
        listTitleStatic.style.display = "none";
        editTitle.style.display = "initial";
        listTitleEdit.style.display = "initial";
        listTitleEdit.focus();
    } else {
        listTitleStatic.style.display = "initial";
        editTitle.style.display = "none";
        listTitleEdit.style.display = "none";
    }
})



const subtaskButtons = document.querySelectorAll(".subtask-button");
const newSubtasks = document.querySelectorAll(".subtask-new");

for (i = 0; i < subtaskButtons.length; i++) {
    let buttonClass = ".subtask-button" + i;
    let button = document.querySelector(buttonClass);
    let taskClass = `.subtask-new${i}`
    let task = document.querySelector(taskClass);
    button.addEventListener("click", function (e) {
        if (task.style.display != "flex") {
            task.style.display = "flex";
            task.focus()
        } else {
            task.style.display = "none";
        }
    })
}
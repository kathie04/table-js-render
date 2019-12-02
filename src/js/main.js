document.addEventListener('DOMContentLoaded', function () {

    //init materialize datepicker

    let datepicker = document.querySelectorAll('.datepicker');
    let instance1 = M.Datepicker.init(datepicker, {
        format: 'mm/dd/yyyy'
    });

    //init materialize select

    let selectAddItem = document.querySelector('#category');
    let selectEditItem = document.querySelector('#editCategory');
    let selectAdd = M.FormSelect.init(selectAddItem);
    let selectEdit = M.FormSelect.init(selectEditItem);

    //init materialize modal

    let modal = document.querySelectorAll('.modal');
    let editModal = M.Modal.init(modal);


    let table = document.querySelector('table tbody');
    let checkbox = document.querySelector('.show-completed');
    let showCompleted = checkbox.checked;
    let taskList = (getTaskList() ? getTaskList() : []);
    let addForm = document.forms[0];
    let editForm = document.forms[1]

    renderTable(table, taskList, showCompleted)

    checkbox.addEventListener('change', function () {
        showCompleted = checkbox.checked;
        renderTable(table, taskList, showCompleted)
    })

    addForm.addEventListener('submit', function (e) {
        let name = this.elements.name.value;
        let deadline = this.elements.deadline.value;
        let category = this.elements.category.value;
        let error = document.querySelector('form .error');
        e.preventDefault();
        if ((!name || !deadline || !category)) {
            if (!error) {
                this.insertAdjacentHTML('beforeend', '<span class="error red-text">Please, fill all fields</span>');
            }
            return
        } else {
            if (error) {
                error.remove();
            }
            let newItem = new Task(this.elements.name.value, this.elements.deadline.value, this.elements.category.value);
            taskList.push(newItem);
            saveTaskList(taskList);
            taskList = getTaskList();
            renderTable(table, taskList, showCompleted)
            this.elements.name.value = '';
            this.elements.deadline.value = '';
            this.elements.category.value = '';
            selectAdd = M.FormSelect.init(selectAddItem);
        }
    })


    editForm.addEventListener('submit', function (e) {
        let name = this.elements.name.value;
        let deadline = this.elements.deadline.value;
        let category = this.elements.category.value;
        let index = this.getAttribute('data-index');
        let error = document.querySelector('form .error');
        e.preventDefault();
        if ((!name || !deadline || !category)) {
            if (!error) {
                this.insertAdjacentHTML('beforeend', '<span class="error red-text">Please, fill all fields</span>');
            }
            return
        } else {
            if (error) {
                error.remove();
            }
            taskList[index].name = name;
            taskList[index].deadline = deadline;
            taskList[index].category = category
            saveTaskList(taskList);
            taskList = getTaskList();
            renderTable(table, taskList, showCompleted)
            this.elements.name.value = '';
            this.elements.deadline.value = '';
            this.elements.category.value = '';
            selectEdit = M.FormSelect.init(selectEditItem);
        }
    })

    table.addEventListener('click', function (e) {
        let target = e.target;
        if (target.closest('.btn-done')) {
            let index = e.target.closest('tr').getAttribute('key');
            var completed = taskList[index].done;
            taskList[index].done = !completed;
            saveTaskList(taskList);
            taskList = getTaskList();
            renderTable(table, taskList, showCompleted)
        }
        if (target.closest('.btn-delete')) {
            let index = e.target.closest('tr').getAttribute('key');
            taskList.splice(index, 1);
            saveTaskList(taskList);
            taskList = getTaskList();
            renderTable(table, taskList, showCompleted);
        }
        if (target.closest('.btn-edit')) {
            let index = e.target.closest('tr').getAttribute('key');
            fillFields(editForm, taskList[index], index);
        }
    })

    function fillFields(form, item, index) {
        form.elements.editName.value = item.name;
        form.elements.editDeadline.value = item.deadline;
        form.elements.editCategory.value = item.category;
        selectEditItem.querySelector('option[value="' + item.category + '"]').selected = true
        selectEdit = M.FormSelect.init(selectEditItem);
        form.setAttribute('data-index', index)
    }
});

function saveTaskList(array) {
    localStorage.setItem('taskList', JSON.stringify(array));
}

function getTaskList() {
    return JSON.parse(localStorage.getItem('taskList'))
}

class Task {
    constructor(name, deadline, category) {
        this.name = name;
        this.deadline = deadline;
        this.category = category;
        this.done = false;
    }
}

function renderTable(elem, array, showCompleted) {
    clearElement(elem)
    elem.insertAdjacentHTML('beforeend', createTable(array, showCompleted));
}

function clearElement(elem) {
    elem.innerHTML = '';
}

function createTable(array, showCompleted) {
    let filterArray = array.filter((item) => {
        if (showCompleted) {
            return item
        } else {
            if (!item.done) {
                return item
            }
        }
    })
    let sortArray = filterArray.sort(function (a, b) {
        var dateA = new Date(a.deadline), dateB = new Date(b.deadline);
        return dateA - dateB
    });
    return sortArray.map((item, index) => {
        let {name, deadline, category, done} = item;
        return `<tr ${done ? 'class="completed"' : ''} key=${index}>
            <td>${index + 1}</td>
            <td>${category}</td>
            <td>${name}</td>
            <td>${deadline}</td>
            <td>      
                <ul class="options">
                     <li><a href="#" class="btn yellow btn-done"><i class="material-icons small">check</i></a></li>
                     <li><a href="#" class="btn green btn-edit modal-trigger" data-target="modal"><i class="material-icons small">create</i></a></li>
                     <li><a href="#" class="btn red btn-delete"><i class="material-icons">clear</i></a></li>
                </ul>
             </td>
             </tr>`
    }).join('');
}
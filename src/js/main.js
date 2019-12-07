document.addEventListener('DOMContentLoaded', function () {

    //init materialize datepicker

    let datepicker = document.querySelectorAll('.datepicker');
    let instance1 = M.Datepicker.init(datepicker, {
        format: 'mm/dd/yyyy'
    });

    let categoryList = ['Work', 'Home', 'Hometask', 'Shopping'];
    let selectAddItem = document.querySelector('#category');
    let selectEditItem = document.querySelector('#editCategory');
    createOptionList(selectAddItem, categoryList);
    createOptionList(selectEditItem, categoryList)


    //init materialize select
    let selectAdd = M.FormSelect.init(selectAddItem);
    let selectEdit = M.FormSelect.init(selectEditItem);

    //init materialize modal

    let modal = document.getElementById('modal');
    let modalWindow = M.Modal.init(modal);
    let editModal = M.Modal.getInstance(modal);

    let radio = document.querySelector('.radio-field')
    createRadioList(radio, categoryList);
    let filterCategory = ''

    let table = document.querySelector('table tbody');
    let checkbox = document.querySelector('.show-completed');
    let showCompleted = checkbox.checked;
    let addForm = document.forms[0];
    let editForm = document.forms[1];
    let sortNameButton = document.querySelector('.sort-name');
    let sortCategoryButton = document.querySelector('.sort-category');
    let sortDeadlineButton = document.querySelector('.sort-date');
    let sortFunctionValue = sortArrayByDeadline;

    let taskList = (getTaskList() ? getTaskList() : []);

    renderTable(table, taskList, showCompleted)

    checkbox.addEventListener('change', function () {
        showCompleted = checkbox.checked;
        renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory)
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
            let newItem = new Task(this.elements.name.value, this.elements.deadline.value, this.elements.category.value, getNewId(taskList));
            taskList.push(newItem);
            saveTaskList(taskList);
            taskList = getTaskList();
            renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory)
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
            renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory)
            this.elements.name.value = '';
            this.elements.deadline.value = '';
            this.elements.category.value = '';
            selectEdit = M.FormSelect.init(selectEditItem);
            editModal.close();
        }
    })

    table.addEventListener('click', function (e) {
        let target = e.target;
        if (target.closest('.btn-done')) {
            let id = e.target.closest('tr').getAttribute('key');
            let index;
            taskList.forEach((item, i) => {
                if (item.id == id) {
                    index = i;
                }
            })
            let completed = taskList[index].done;
            taskList[index].done = !completed;
            saveTaskList(taskList);
            taskList = getTaskList();
            renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory)
        }
        if (target.closest('.btn-delete')) {
            let id = e.target.closest('tr').getAttribute('key');
            let index
            taskList.forEach((item, i) => {
                if (item.id == id) {
                    index = i;
                }
            })
            taskList.splice(index, 1);
            saveTaskList(taskList);
            taskList = getTaskList();
            renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory);
        }
        if (target.closest('.btn-edit')) {
            let id = e.target.closest('tr').getAttribute('key');
            let item = taskList.filter((item) => {
                if (item.id == id) return item
            })[0];
            fillFields(editForm, item, id);
        }
    })

    radio.addEventListener('change', function () {
        filterCategory = this.querySelector('input:checked').value;
        renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory);
    })

    function fillFields(form, item, index) {
        form.elements.editName.value = item.name;
        form.elements.editDeadline.value = item.deadline;
        form.elements.editCategory.value = item.category;
        selectEditItem.querySelector('option[value="' + item.category + '"]').selected = true;
        selectEdit = M.FormSelect.init(selectEditItem);
        form.setAttribute('data-index', index)
    }

    sortNameButton.addEventListener('click', function () {
        this.classList.add('underline');
        sortCategoryButton.classList.remove('underline');
        sortDeadlineButton.classList.remove('underline');
        if (this.classList.contains('sort-down')) {
            sortFunctionValue = sortArrayByNameDown;
        } else {
            sortFunctionValue = sortArrayByName;
        }
        renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory);
        this.classList.toggle('sort-down')
    });

    sortCategoryButton.addEventListener('click', function () {
        this.classList.add('underline');
        sortNameButton.classList.remove('underline');
        sortDeadlineButton.classList.remove('underline');
        if (this.classList.contains('sort-down')) {
            sortFunctionValue = sortArrayByCategoryDown;
        } else {
            sortFunctionValue = sortArrayByCategory;
        }
        this.classList.toggle('sort-down')
        renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory);
    });

    sortDeadlineButton.addEventListener('click', function () {
        this.classList.add('underline');
        sortCategoryButton.classList.remove('underline');
        sortNameButton.classList.remove('underline');
        if (this.classList.contains('sort-down')) {
            sortFunctionValue = sortArrayByDeadlineDown;
        } else {
            sortFunctionValue = sortArrayByDeadline;
        }
        this.classList.toggle('sort-down')
        renderTable(table, taskList, showCompleted, sortFunctionValue, filterCategory);
    })

    function renderTable(elem, array, showCompleted, sortFunction = sortFunctionValue, filterCategory = filterCategory) {
        clearElement(elem)
        elem.insertAdjacentHTML('beforeend', createTable(array, showCompleted, sortFunction, filterCategory));
    }

});

function getNewId(array) {
    if (array.length) {
        let maxId = +array[0].id;
        array.forEach((item) => {
            if (+item.id > maxId) {
                maxId = +item.id
            }
        })
        return (maxId + 1)
    } else return 0
}

function saveTaskList(array) {
    localStorage.setItem('taskList', JSON.stringify(array));
}

function getTaskList() {
    return JSON.parse(localStorage.getItem('taskList'))
}

class Task {
    constructor(name, deadline, category, id) {
        this.id = id;
        this.name = name;
        this.deadline = deadline;
        this.category = category;
        this.done = false;
    }
}

function clearElement(elem) {
    elem.innerHTML = '';
}

function filterArray(array, showCompleted) {
    return array.filter((item) => {
        if (showCompleted) {
            return item
        } else {
            if (!item.done) {
                return item
            }
        }
    })
}

function filterByCategory(array, value) {
    return array.filter((item) => {
        if (item.category == value) {
            return item
        }
    })
}

function sortArrayByDeadline(array) {
    return array.sort(function (a, b) {
        let dateA = new Date(a.deadline)
        let dateB = new Date(b.deadline);
        return dateA - dateB;
    });
}

function sortArrayByDeadlineDown(array) {
    return array.sort(function (a, b) {
        let dateA = new Date(a.deadline)
        let dateB = new Date(b.deadline);
        return dateB - dateA;
    });
}

function sortArrayByName(array) {
    return array.sort(function (a, b) {
        let nameA = a.name.toLowerCase();
        let nameB = b.name.toLowerCase();
        if (nameA < nameB)
            return -1
        if (nameA > nameB)
            return 1
        return 0
    });
}

function sortArrayByNameDown(array) {
    return array.sort(function (a, b) {
        let nameA = a.name.toLowerCase();
        let nameB = b.name.toLowerCase();
        if (nameA > nameB)
            return -1
        if (nameA < nameB)
            return 1
        return 0
    });
}

function sortArrayByCategory(array) {
    return array.sort(function (a, b) {
        let nameA = a.category.toLowerCase();
        let nameB = b.category.toLowerCase();
        if (nameA < nameB)
            return -1
        if (nameA > nameB)
            return 1
        return 0
    });
}

function sortArrayByCategoryDown(array) {
    return array.sort(function (a, b) {
        let nameA = a.category.toLowerCase();
        let nameB = b.category.toLowerCase();
        if (nameA > nameB)
            return -1
        if (nameA < nameB)
            return 1
        return 0
    });
}

function createTable(array, showCompleted, sortFunction, filterCategory) {
    let filteredByCategoryArray = array;
    if (filterCategory) {
        filteredByCategoryArray = filterByCategory(array, filterCategory)
    }
    let filteredArray = filterArray(filteredByCategoryArray, showCompleted);
    let sortedArray = sortFunction(filteredArray);
    return sortedArray.map((item, index) => {
        let {id, name, deadline, category, done} = item;
        return `<tr ${done ? 'class="completed"' : ''} key=${id}>
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

function createOptionList(elem, array) {
    let optionList = array.map((item) => {
        return `<option value=${item}>${item}</option>`
    }).join('')
    elem.insertAdjacentHTML('beforeend', optionList)
}

function createRadioList(elem, array) {
    let radioList = array.map((item) => {
        return `<p>
                  <label>
                    <input class="with-gap" name="category-filter" type="radio" value=${item}>
                    <span>${item}</span>
                  </label>
                </p>`
    }).join('')
    elem.insertAdjacentHTML('beforeend', radioList)
}

//IE polifill for closest

(function () {
    if (!Element.prototype.closest) {
        Element.prototype.closest = function (css) {
            var node = this;

            while (node) {
                if (node.matches(css)) return node;
                else node = node.parentElement;
            }
            return null;
        };
    }

})();

//IE polifill for matches

(function () {
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector;
    }
})();
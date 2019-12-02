"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

document.addEventListener('DOMContentLoaded', function () {
  //init materialize datepicker
  var datepicker = document.querySelectorAll('.datepicker');
  var instance1 = M.Datepicker.init(datepicker, {
    format: 'mm/dd/yyyy'
  }); //init materialize select

  var selectAddItem = document.querySelector('#category');
  var selectEditItem = document.querySelector('#editCategory');
  var selectAdd = M.FormSelect.init(selectAddItem);
  var selectEdit = M.FormSelect.init(selectEditItem); //init materialize modal

  var modal = document.querySelectorAll('.modal');
  var editModal = M.Modal.init(modal);
  var table = document.querySelector('table tbody');
  var checkbox = document.querySelector('.show-completed');
  var showCompleted = checkbox.checked;
  var taskList = getTaskList() ? getTaskList() : [];
  var addForm = document.forms[0];
  var editForm = document.forms[1];
  var sortNameButton = document.querySelector('.sort-name');
  var sortCategoryButton = document.querySelector('.sort-category');
  var sortDeadlineButton = document.querySelector('.sort-date');
  renderTable(table, taskList, showCompleted);
  checkbox.addEventListener('change', function () {
    showCompleted = checkbox.checked;
    renderTable(table, taskList, showCompleted);
  });
  addForm.addEventListener('submit', function (e) {
    var name = this.elements.name.value;
    var deadline = this.elements.deadline.value;
    var category = this.elements.category.value;
    var error = document.querySelector('form .error');
    e.preventDefault();

    if (!name || !deadline || !category) {
      if (!error) {
        this.insertAdjacentHTML('beforeend', '<span class="error red-text">Please, fill all fields</span>');
      }

      return;
    } else {
      if (error) {
        error.remove();
      }

      var newItem = new Task(this.elements.name.value, this.elements.deadline.value, this.elements.category.value);
      taskList.push(newItem);
      saveTaskList(taskList);
      taskList = getTaskList();
      renderTable(table, taskList, showCompleted);
      this.elements.name.value = '';
      this.elements.deadline.value = '';
      this.elements.category.value = '';
      selectAdd = M.FormSelect.init(selectAddItem);
    }
  });
  editForm.addEventListener('submit', function (e) {
    var name = this.elements.name.value;
    var deadline = this.elements.deadline.value;
    var category = this.elements.category.value;
    var index = this.getAttribute('data-index');
    var error = document.querySelector('form .error');
    e.preventDefault();

    if (!name || !deadline || !category) {
      if (!error) {
        this.insertAdjacentHTML('beforeend', '<span class="error red-text">Please, fill all fields</span>');
      }

      return;
    } else {
      if (error) {
        error.remove();
      }

      taskList[index].name = name;
      taskList[index].deadline = deadline;
      taskList[index].category = category;
      saveTaskList(taskList);
      taskList = getTaskList();
      renderTable(table, taskList, showCompleted);
      this.elements.name.value = '';
      this.elements.deadline.value = '';
      this.elements.category.value = '';
      selectEdit = M.FormSelect.init(selectEditItem);
    }
  });
  table.addEventListener('click', function (e) {
    var target = e.target;

    if (target.closest('.btn-done')) {
      var index = e.target.closest('tr').getAttribute('key');
      var completed = taskList[index].done;
      taskList[index].done = !completed;
      saveTaskList(taskList);
      taskList = getTaskList();
      renderTable(table, taskList, showCompleted);
    }

    if (target.closest('.btn-delete')) {
      var _index = e.target.closest('tr').getAttribute('key');

      taskList.splice(_index, 1);
      saveTaskList(taskList);
      taskList = getTaskList();
      renderTable(table, taskList, showCompleted);
    }

    if (target.closest('.btn-edit')) {
      var _index2 = e.target.closest('tr').getAttribute('key');

      fillFields(editForm, taskList[_index2], _index2);
    }
  });

  function fillFields(form, item, index) {
    form.elements.editName.value = item.name;
    form.elements.editDeadline.value = item.deadline;
    form.elements.editCategory.value = item.category;
    selectEditItem.querySelector('option[value="' + item.category + '"]').selected = true;
    selectEdit = M.FormSelect.init(selectEditItem);
    form.setAttribute('data-index', index);
  }

  sortNameButton.addEventListener('click', function () {
    if (this.classList.contains('sort-down')) {
      renderTable(table, taskList, showCompleted, sortArrayByNameDown);
    } else {
      renderTable(table, taskList, showCompleted, sortArrayByName);
    }

    this.classList.toggle('sort-down');
  });
  sortCategoryButton.addEventListener('click', function () {
    if (this.classList.contains('sort-down')) {
      renderTable(table, taskList, showCompleted, sortArrayByCategoryDown);
    } else {
      renderTable(table, taskList, showCompleted, sortArrayByCategory);
    }

    this.classList.toggle('sort-down');
  });
  sortDeadlineButton.addEventListener('click', function () {
    if (this.classList.contains('sort-down')) {
      renderTable(table, taskList, showCompleted, sortArrayByDeadlineDown);
    } else {
      renderTable(table, taskList, showCompleted, sortArrayByDeadline);
    }

    this.classList.toggle('sort-down');
  });
});

function saveTaskList(array) {
  localStorage.setItem('taskList', JSON.stringify(array));
}

function getTaskList() {
  return JSON.parse(localStorage.getItem('taskList'));
}

var Task = function Task(name, deadline, category) {
  _classCallCheck(this, Task);

  this.name = name;
  this.deadline = deadline;
  this.category = category;
  this.done = false;
};

function renderTable(elem, array, showCompleted) {
  var sortFunction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sortArrayByDeadline;
  clearElement(elem);
  elem.insertAdjacentHTML('beforeend', createTable(array, showCompleted, sortFunction));
}

function clearElement(elem) {
  elem.innerHTML = '';
}

function filterArray(array, showCompleted) {
  return array.filter(function (item) {
    if (showCompleted) {
      return item;
    } else {
      if (!item.done) {
        return item;
      }
    }
  });
}

function sortArrayByDeadline(array) {
  return array.sort(function (a, b) {
    var dateA = new Date(a.deadline);
    var dateB = new Date(b.deadline);
    return dateA - dateB;
  });
}

function sortArrayByDeadlineDown(array) {
  return array.sort(function (a, b) {
    var dateA = new Date(a.deadline);
    var dateB = new Date(b.deadline);
    return dateB - dateA;
  });
}

function sortArrayByName(array) {
  return array.sort(function (a, b) {
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

function sortArrayByNameDown(array) {
  return array.sort(function (a, b) {
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    if (nameA > nameB) return -1;
    if (nameA < nameB) return 1;
    return 0;
  });
}

function sortArrayByCategory(array) {
  return array.sort(function (a, b) {
    var nameA = a.category.toLowerCase();
    var nameB = b.category.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

function sortArrayByCategoryDown(array) {
  return array.sort(function (a, b) {
    var nameA = a.category.toLowerCase();
    var nameB = b.category.toLowerCase();
    if (nameA > nameB) return -1;
    if (nameA < nameB) return 1;
    return 0;
  });
}

function createTable(array, showCompleted, sortFunction) {
  var filteredArray = filterArray(array, showCompleted);
  var sortedArray = sortFunction(filteredArray);
  return sortedArray.map(function (item, index) {
    var name = item.name,
        deadline = item.deadline,
        category = item.category,
        done = item.done;
    return "<tr ".concat(done ? 'class="completed"' : '', " key=").concat(index, ">\n            <td>").concat(index + 1, "</td>\n            <td>").concat(category, "</td>\n            <td>").concat(name, "</td>\n            <td>").concat(deadline, "</td>\n            <td>      \n                <ul class=\"options\">\n                     <li><a href=\"#\" class=\"btn yellow btn-done\"><i class=\"material-icons small\">check</i></a></li>\n                     <li><a href=\"#\" class=\"btn green btn-edit modal-trigger\" data-target=\"modal\"><i class=\"material-icons small\">create</i></a></li>\n                     <li><a href=\"#\" class=\"btn red btn-delete\"><i class=\"material-icons\">clear</i></a></li>\n                </ul>\n             </td>\n             </tr>");
  }).join('');
}
//# sourceMappingURL=main.js.map

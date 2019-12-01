"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

document.addEventListener('DOMContentLoaded', function () {
  var datepicker = document.querySelectorAll('.datepicker');
  var instance1 = M.Datepicker.init(datepicker, {
    format: 'mm/dd/yyyy'
  });
  var select = document.querySelectorAll('select');
  var instance2 = M.FormSelect.init(select);
  var table = document.querySelector('table tbody');
  var checkbox = document.querySelector('.show-completed');
  var showCompleted = checkbox.checked;
  var taskList = [];
  checkbox.addEventListener('change', function () {
    showCompleted = checkbox.checked;
    renderTable(table, taskList, showCompleted);
  });
  document.forms[0].addEventListener('submit', function (e) {
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
      console.log(taskList);
      renderTable(table, taskList, showCompleted);
      this.elements.name.value = '';
      this.elements.deadline.value = '';
      this.elements.category.value = '';
      instance2 = M.FormSelect.init(select);
    }
  });
  table.addEventListener('click', function (e) {
    var target = e.target;

    if (target.closest('.btn-done')) {
      var index = e.target.closest('tr').getAttribute('key');
      var completed = taskList[index].done;
      taskList[index].done = !completed;
      renderTable(table, taskList, showCompleted);
    }

    if (target.closest('.btn-delete')) {
      var _index = e.target.closest('tr').getAttribute('key');

      taskList.splice(_index, 1);
      renderTable(table, taskList, showCompleted);
    }
  });
});

var Task = function Task(name, deadline, category) {
  _classCallCheck(this, Task);

  this.name = name;
  this.deadline = deadline;
  this.category = category;
  this.done = false;
};

function renderTable(elem, array, showCompleted) {
  clearElement(elem);
  elem.insertAdjacentHTML('beforeend', createTable(array, showCompleted));
}

function clearElement(elem) {
  elem.innerHTML = '';
}

function createTable(array, showCompleted) {
  var filterArray = array.filter(function (item) {
    if (showCompleted) {
      return item;
    } else {
      if (!item.done) {
        return item;
      }
    }
  });
  var sortArray = filterArray.sort(function (a, b) {
    var dateA = new Date(a.deadline),
        dateB = new Date(b.deadline);
    return dateA - dateB;
  });
  return sortArray.map(function (item, index) {
    var name = item.name,
        deadline = item.deadline,
        category = item.category,
        done = item.done;
    return "<tr ".concat(done ? 'class="completed"' : '', " key=").concat(index, ">\n            <td>").concat(index + 1, "</td>\n            <td>").concat(category, "</td>\n            <td>").concat(name, "</td>\n            <td>").concat(deadline, "</td>\n            <td>      \n                <ul class=\"options\">\n                     <li><a href=\"#\" class=\"btn yellow btn-done\"><i class=\"material-icons small\">check</i></a></li>\n                     <li><a href=\"#\" class=\"btn green btn-update\"><i class=\"material-icons small\">create</i></a></li>\n                     <li><a href=\"#\" class=\"btn red btn-delete\"><i class=\"material-icons\">clear</i></a></li>\n                </ul>\n             </td>\n             </tr>");
  }).join('');
}
//# sourceMappingURL=main.js.map

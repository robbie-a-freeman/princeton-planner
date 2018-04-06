// document.getElementById("name").childNodes[1].childNodes[0].valu

// Names of the inputs being asked for.
var fields = [
  "name",
  "is_pdf",
  "year",
  "req_list",
];

// On load function to set up table.
function fields_init() {
  var fields_div = document.getElementById("__fields__");
  var table = document.createElement("table");
  table.style = "width:80%";

  for (var f = 0; f < fields.length; f++) {
    table.appendChild(createTableRow(fields[f]));
  }

  fields_div.appendChild(table);

  var submit = document.createElement("button");
  submit.onclick = submit_handler;
  submit.appendChild(text("Generate"));
  fields_div.append(submit);

  fields_div.appendChild(newlines(4));

  var results = document.createElement("textarea")
  results.id = "dump";
  results.rows = "10";
  results.cols = "50";
  fields_div.appendChild(results);
}

function submit_handler() {
  var obj = {};
  for (var i = 0; i < fields.length; i++) {
    obj[fields[i]]=value(fields[i]);
  }
  $("#dump")[0].value=JSON.stringify(obj, null, 4);
}

// Add an input field corresponding to name to the target DOM element
function createInputField(size, id) {
  var input = document.createElement("input");
  input.type = "text";
  input.size = size;
  input.placeholder = id;
  input.id = id;
  return input;
}

// Add a row to the specified table based on given input strings
function createTableRow(name) {
  var tr = document.createElement("tr");
  var td_name = document.createElement("td");
  var td_text = document.createElement("td");

  td_name.appendChild(text(name));
  td_text.appendChild(createInputField(50, name));

  tr.appendChild(td_name);
  tr.appendChild(td_text);

  return tr;
}

// Returns a text node for the DOM with given string
function text(str) {
  return document.createTextNode(str);
}

function newlines(num) {
  var div = document.createElement("div");
  for (var i = 0; i < num; i++) {
    var br = document.createElement("br");
    div.appendChild(br);
  }
  return div
}

function value(name) {
  var id = "#" + name;
  return $(id)[0].value;
}

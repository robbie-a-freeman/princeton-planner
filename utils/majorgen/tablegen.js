
// Counter for distributing unique element IDs (UIDs)
var UID_count = 0;

// ==================== Initiializer =============================
var TEST_OBJ = { "profs": [{"uid": "str", "name":"str"}],
                "title": "str",
                "courseid": "str",
                "tag": {
                          "dept":"str",
                          "number":"str"
                       },
                "list": ["str"]
               };

function tablegen_init() {
  $("#__fields__")[0].appendChild(createTable(TEST_OBJ));
}

// =================== Creators ==================================
// Given an object obj representing json data, return an html
// table with one input field for each of obj's fields.
function createTable(obj) {
  // Create the containing table.
  var table = document.createElement("table");
  table.style = "width:80%";
  table.id = UID();

  // Iterate over keys of obj

  if (typeof obj == "string"){
    return createInputField(50, name, UID());
  }
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = obj[key];

    // Check what type is associated with the current key.
    if (typeof val == "string") {
      // Add a single table row corresponding to the string.
      var inputField = createInputField(50, name, UID());
      var row = createTableRow(text(key), inputField);
      row.type = "string";
      table.appendChild(row);
    }
    // Array check must come before obj check b/c arrays are objects!
    else if (Array.isArray(val)) {
      // Add a table row containing:
      // A table containing:
      // A table row containing:
      // A filler table entry on the left
      // And a table entry on the right containing:
      // A button that will insert a row of the correct type.

      // Create a new table
      var inner_table = document.createElement("table");
      var table_id = UID();
      var button_tr_id = UID();
      inner_table.id = table_id;
      inner_table.button_tr_id = button_tr_id;
      // Using val[0] error prone (what if empty?) and not general (what if >1 exist?)
      // This limitation implies all elements in an array must have homogenous json structure.
      inner_table.format_obj = val[0];

      var filler_td = document.createElement("td");
      var button_td = document.createElement("td");

      // Create the "add more" button
      var button = document.createElement("button");
      button.table_id = table_id;
      button.onclick = function() {addRowAbove(this.table_id)} // Likely bugged.
      button.appendChild(text("+"));
      button.setAttribute("tabindex", "-1"); // disable tabbing onto this button
      button.classList.add("plusbutton");
      button_td.appendChild(button);


      // Create the table row in which the button will reside
      var button_tr = createTableRow(filler_td, button_td);
      button_tr.type = "none";
      button_tr.id = button_tr_id;

      // Add the initial row to the table.
      inner_table.appendChild(button_tr);

      // Add the top-level table row.
      var tr = createTableRow(text(key), inner_table);
      tr.type = "array";
      table.appendChild(tr);
    }
    else if (typeof val == "object") {
      var tr = createTableRow(text(key), createTable(val));
      tr.type = "object";
      table.appendChild(tr);
    }
  }

  return table;
}

function createTableRow(label, content) {
  var tr = document.createElement("tr");
  var td_label = document.createElement("td");
  var td_content = document.createElement("td");
  td_label.appendChild(label);
  td_content.appendChild(content);
  tr.appendChild(td_label);
  tr.appendChild(td_content);
  return tr;
}

// Add a row to the specified table based on given input strings
/*
function createTableRow(name, uid) {
  var tr = document.createElement("tr");
  var td_name = document.createElement("td");
  var td_text = document.createElement("td");

  td_name.appendChild(text(name));
  td_text.appendChild(createInputField(50, name, uid));

  tr.appendChild(td_name);
  tr.appendChild(td_text);

  return tr;
}
*/

// Add an input field corresponding to name to the target DOM element
function createInputField(size, name, uid) {
  var input = document.createElement("input");
  input.type = "text";
  input.size = size;
  input.placeholder = name;
  input.id = uid;
  return input;
}

// ================= Handlers =================================
function addRowAbove(table_id) {

  // Store the table and button row for later use
  var table = $("#"+table_id)[0];
  var button_tr = $("#"+table.button_tr_id)[0];

  // Remove the button row from the end of the table.
  table.removeChild(button_tr);

  // Add in a new row based on the format_obj;
  // TODO Add a button to remove this content

  // Create a remove row button
  var button = document.createElement("button");
  button.table_id = table_id;
  button.onclick = function() {removeRow(this.table_id, this)} // Likely bugged.
  button.appendChild(text("-"));
  button.classList.add("minusbutton");
  button.setAttribute("tabindex", "-1"); // disable tabbing onto this button

  var content = createTable(table.format_obj);
  var new_tr = createTableRow(button, content);
  new_tr.type = "array_entry"; // Double check this is correct
  table.appendChild(new_tr);

  // Add back in the button row.
  table.appendChild(button_tr);

}

function removeRow(table_id, button) {
  var table = $("#"+table_id)[0];
  var button_td = button.parentElement;
  var button_tr = button_td.parentElement;
  table.removeChild(button_tr);
}


// ================= Simple Helpers ===========================
// Convert num to base 36
function numToUID(num) {
  var b36str = num.toString(36);
  // Pad with 0 on left until 6 chars long.
  while (b36str.length < 6) {
    b36str = "0" + b36str;
  }
  return b36str;
}

// Generate a new UID and increment the counter.
function UID() {
  var uid = numToUID(UID_count);
  UID_count++;
  return uid;
}

function text(str) {
  return document.createTextNode(str);
}

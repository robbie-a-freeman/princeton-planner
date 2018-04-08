
// Counter for distributing unique element IDs (UIDs)
var UID_count = 0;

// ==================== Initiializer =============================
var FORMAT_OBJ =

// ============ Format code goes below! ==========================
{
      "debug":          {   "profs": [{"uid": "str", "name":"str"}],
                            "title": "str",
                            "courseid": "str",
                            "tag": {
                                      "dept":"str",
                                      "number":"str"
                            },
                            "list": ["str"]
                          },
      "Major":            {  "type":    "str",
                             "name":    "str",
                             "code":    "str",
                             "degree":  "str",
                             "year":    "str",
                             "urls":   ["str"],
                             "req_list": [ {"name":"str", "req_list":{} } ]
                          },
      "Requirement":      {  "name":            "str",
                             "max_counted":     "str",
                             "min_needed":      "str",
                             "description":     "str",
                             "explanation":     "str",
                             "double_counting_allowed": "str",
                             "pdf_allowed":     "str",
                             "req_list": [ {"name":"str", "req_list":{} } ]
                           },
      "CourseList":        {  "course_list": ["str"]
                           }

      }
// =========================== End format code ==============================


// ========================= Initializers ===================================
function tablegen_init() {
  var keys = Object.keys(FORMAT_OBJ);

  // Create each tab
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    // Create the tab button and setup its properties.
    var button = document.createElement("button");
    button.classList.add("tablinks");
    button.appendChild(text(key));
    button.tab_name=key;
    button.onclick = function() { tab_handler(event, this.tab_name); };

    // Add the button to the tabs div.
    $("#__tabs__")[0].appendChild(button);

    // Create div associated with each tab.
    field_init(FORMAT_OBJ[key], key, button);
  }
  // $("#__fields__")[0].appendChild(createTable(TEST_OBJ));
}

// Initialize the single field form specified by format_obj, adding it
// to a subdiv of the main format div. Set it up for use with tabs.
function field_init(format_obj, tab_name, button) {
  var fields_div = $("#__fields__")[0];

  // Create a subdiv to hold each of the tabbed options.
  var subdiv = document.createElement("div");
  subdiv.id = tab_name;
  subdiv.classList.add("tabcontent");

  // Fill a single subdiv.
  var table = createTable(format_obj, tab_name);

  // Inform the button of the table's root ID for event handling
  button.root_id = table.id;

  // Add the table to subdiv and subdiv to doc.
  subdiv.appendChild(table);
  fields_div.appendChild(subdiv);
}

// =================== Creators ==================================
// Given an object obj representing json data, return an html
// table with one input field for each of obj's fields.
function createTable(obj, name) {
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
      var inputField = createInputField(50, key, UID());
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
      inner_table.array_name = key;

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
      var tr = createTableRow(text(key), createTable(val, key));
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

// Add an input field corresponding to name to the target DOM element
function createInputField(size, name, uid) {
  var input = document.createElement("input");
  input.type = "text";
  input.size = size;
  input.setAttribute("placeholder", name);
  input.id = uid;
  return input;
}

// ================= Handlers =================================
// Used by array-type tables to expand their element count.
function addRowAbove(table_id) {

  // Store the table and button row for later use
  var table = $("#"+table_id)[0];
  var button_tr = $("#"+table.button_tr_id)[0];

  // Remove the button row from the end of the table.
  table.removeChild(button_tr);

  // Add in a new row based on the format_obj;

  // Create a remove row button
  var button = document.createElement("button");
  button.table_id = table_id;
  button.onclick = function() {removeRow(this.table_id, this)} // Likely bugged.
  button.appendChild(text("\u2716"));
  button.classList.add("minusbutton");
  button.setAttribute("tabindex", "-1"); // disable tabbing onto this button

  var content = createTable(table.format_obj, table.array_name);
  var new_tr = createTableRow(button, content);
  new_tr.type = "array_entry"; // Double check this is correct
  table.appendChild(new_tr);

  // Add back in the button row.
  table.appendChild(button_tr);

}

// Remove the row containing the pressed button.
function removeRow(table_id, button) {
  var table = $("#"+table_id)[0];
  var button_td = button.parentElement;
  var button_tr = button_td.parentElement;
  table.removeChild(button_tr);
}

// Handles presses of the tab buttons.
function tab_handler(event, tab_name) {
  var name = tab_name;
  //console.log(name);
  $(".tabcontent").css('display', 'none'); // Hide all tab content
  $(".tablinks").removeClass("active");    // Deactivate active tab
  $("#"+name).css('display', 'block');     // Show the desired tab
  event.currentTarget.className += " active";  // Activate the desired tab.
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

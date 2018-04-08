// document.getElementById("name").childNodes[1].childNodes[0].valu

// Defines the tab and field structure used by the majorgen program
var json_format =

// ===========================================================================
// ===               YOUR JSON GOES BELOW THIS LINE                        ===
// ===========================================================================

// Sample Courses JSON
/*
{
  "Courses":     ["profs",
                  "title",
                  "courseid",
                  "listings",
                  "area",
                  "prereqs",
                  "descrip",
                  "classes"],
  "Profs":        ["uid",
                   "name"],
  "Classes":      ["classnum",
                   "enroll",
                   "limit",
                   "starttime",
                   "section",
                   "endtime",
                   "roomnum",
                   "days",
                   "bldg"]

}
*/

// Sample Courses JSON:
{
  "Courses":    { "profs": [{"uid": "str", "name":"str"}],
                  "title": "str",
                  "courseid": "str"},
  "Courses":    { "profs": [{"uid": "str", "name":"str"}],
                  "title": "str",
                  "courseid": "str"},
}

// ===========================================================================
// ===               END OF JSON FORMAT                                    ===
// ===========================================================================

// Auto-copy the generated json to clipboard if true.
var copy_enable = true;

// Counter for generating unique Element IDs
//var UID_count = 0;

// ===================== Initializers ======================
// on-load top level function
function init() {
  tabs_init();
  output_init();
}

function tabs_init() {
  var tab_names = Object.keys(json_format);

  // Create each tab
  for (var i = 0; i < tab_names.length; i++) {
    var tab_name = tab_names[i];
    $("#__tabs__")[0].appendChild(createTabButton(tab_name));

    // Create div associated with each tab.
    fields_init(keys[i]);
  }
}

// On load function to set up table.
function fields_init(fields_key) {
  var fields_div = document.getElementById("__fields__");

  // Create a subdiv to hold each of the tabbed options.
  var subdiv = document.createElement("div");
  subdiv.id = fields_key;
  subdiv.classList.add("tabcontent");

  // Fill a single subdiv.
  var table = document.createElement("table");
  table.style = "width:80%";

  // Add a row of the table for each line of input
  var fieldObj = json_format[fields_key];
  var keys = Object.keys(fieldObj);
  for (var  i= 0; f < keys.length; i++) {
    var key = keys[i];
    var targetData = fieldObj[key];
    console.log(targetData);
    if (typeof targetData == "string")
        // Add a single row
        table.appendChild(createTableRow(keys[i]));
    else if (Arrays.isArray()) {
        // Add a row capable of replicating
    }
    else if (typeof targetData == "object") {
        // Add a fixed number of rows.

    }
    else {
      console.log("Illegal data type passed to fields_init")
    }

  }
    // table.appendChild(createTableRow(fields[i]));


  // Add the table to subdiv and subdiv to doc.
  subdiv.appendChild(table);
  fields_div.appendChild(subdiv);
}

// initialize generation area
function output_init() {
  var output_div = $("#__output__")[0];

  // Add a submission button
  var button = document.createElement("button");
  button.onclick = submit_handler;
  button.appendChild(text("Generate"));
  button.classList.add("submit_button");
  output_div.append(button);

  // Add blank space
  output_div.appendChild(newlines(2));

  // Add the output area
  var results = document.createElement("textarea")
  results.id = "dump";
  results.rows = "10";
  results.cols = "50";
  output_div.appendChild(results);
}

// ======================== Handlers ============================
// Handles button presses of the submit button
// Generates the json output, and copies to clipboard
function submit_handler() {
  var obj = {};
  var activeTab = $(".tablinks.active")[0].innerText;
  var fields = json_format[activeTab];
  // console.log(fields);
  for (var i = 0; i < fields.length; i++) {
    obj[fields[i]]=value(fields[i]);
  }
  $("#dump")[0].value=JSON.stringify(obj, null, 4);

  // Copy the result to clipboard
  if (copy_enable) {
    $("#dump")[0].select();
    document.execCommand("Copy");
  }
}

// Handles presses of the tab buttons.
function tab_handler(event, id) {
  var name = but_name(id);
  //console.log(name);
  $(".tabcontent").css('display', 'none');
  $(".tablinks").removeClass("active");
  $("#"+name).css('display', 'block');
  event.currentTarget.className += " active";
}

// =================== Creators ==================================
// Given an object obj representing json data, return an html
// table with one input field for each of obj's fields.
/*
function createTable(obj) {
  // Create the containing table.
  var table = document.createElement("table");
  table.style = "width:80%";

  // Iterate over keys of obj.
  var keys = Object.keys(obj);
  console.log(keys);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = obj[key];

    // Check what type is associated with the current key.
    if (typeof val == "string") {
      // console.log("Key " + key + " associated with value of type string");
      // Add a single table row corresponding to the string.
      table.appendChild(createTableRow(key, UID()));
    }
    // Array check must come before obj check b/c arrays are objects!
    else if (Array.isArray(val)) {
      // console.log("Key " + key + " associated with value of type array");

    }
    else if (typeof val == "object") {
      // console.log("Key " + key + " associated with value of type object");
    }
  }
}

// Add a row to the specified table based on given input strings
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

// Add an input field corresponding to name to the target DOM element
function createInputField(size, name, uid) {
  var input = document.createElement("input");
  input.type = "text";
  input.size = size;
  input.placeholder = name;
  input.id = uid;
  return input;
}
*/

// Create a button for the tab listing, with the given name
function createTabButton(name) {
  var button = document.createElement("button");
  button.classList.add("tablinks");
  //console.log(key);
  button.appendChild(text(key));
  button.id="button_"+key;
  //console.log(button.id);
  button.onclick = function() { tab_handler(event, this.id); };
  return button;
}

// ================= Simple Helpers ===========================
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
  // console.log(typeof name);
  var id = "#" + name;
  return $(id)[0].value;
}

function but_name(but_id) {
  // console.log(typeof but_id)
  return but_id.substring(7);
}

/*
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
*/

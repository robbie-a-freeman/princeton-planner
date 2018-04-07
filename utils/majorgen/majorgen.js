// document.getElementById("name").childNodes[1].childNodes[0].valu

// Defines the tab and field structure used by the majorgen program
var fields_obj =

// ===========================================================================
// ===               YOUR JSON GOES BELOW THIS LINE                        ===
// ===========================================================================

/* // Sample majors json
{
  "first":      ["name",
                 "is_pdf",
                 "year",
                 "req_list"],
  "second":     ["course1",
                 "course2",
                 "course3",
                 "course4"],
  "third":      ["name",
                 "descrip",
                 "prof",
                 "min",
                 "max"]
};
*/
// Sample Courses JSON
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

// ===========================================================================
// ===               END OF JSON FORMAT                                    ===
// ===========================================================================

// Auto-copy the generated json to clipboard if true.
var copy_enable = true;

// ===================== Initializers ======================
// on-load top level function
function init() {
  tabs_init();
  output_init();
}

function tabs_init() {
  var keys = Object.keys(fields_obj);

  // Create each tab
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var button = document.createElement("button");
    button.classList.add("tablinks");
    //console.log(key);
    button.appendChild(text(key));
    button.id="button_"+key;
    //console.log(button.id);
    button.onclick = function() { tab_handler(event, this.id); };
    $("#__tabs__")[0].appendChild(button);

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
  var fields = fields_obj[fields_key];
  for (var f = 0; f < fields.length; f++) {
    table.appendChild(createTableRow(fields[f]));
  }

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
  output_div.append(button);

  // Add blank space
  output_div.appendChild(newlines(4));

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
  var fields = fields_obj[activeTab];
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

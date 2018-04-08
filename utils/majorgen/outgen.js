
// The ID of the top-level table.
var ROOT_ID = "000000";

// Whether or not to automatically copy output to clipboard
var copy_enable = true;

// Add an output area and a generate button.
function outgen_init() {
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

function submit_handler() {
  var root = $("#" + ROOT_ID)[0];
  var obj = getTableAsObj(root);

  // Set value of output field.
  $("#dump")[0].value=JSON.stringify(obj, null, 4);

  // Copy the result to clipboard
  if (copy_enable) {
    $("#dump")[0].select();
    document.execCommand("Copy");
  }
}


function getTableAsObj(table) {
  var obj = {};

  // Start at the root of this table tree
  var rows = table.children;

  // Iterate over all rows tr in root tree
  for (var i = 0; i < rows.length; i++) {
    var tr = rows[i];

    // Compute the row's object representation
    var rowObj = getRowAsObj(tr);

    // Add this row's data into the overall object.
    Object.assign(obj, rowObj);

    // For each row, three (four) cases:

  /*
  // tr.type == "string"
  if (tr.type == "string") {
    var key = getKey(tr);
    var right = getRight(tr);
    var value = getValue(right);
    obj[key] = value;
  }

  // tr.type == "array"
  else if (tr.type == "array") {
    var arr = [];
    var entries = right(tr);
    // length - 1 because the last row is just the add button.
    for (var i = 0; i < entries.length - 1; i++) {
      // Get a value from each row and push to arr.

    }
    continue;
  }
  // tr.type == "object"
  else if (tr.type == "object") {
    var key = getKey(tr);
    var right = getRight(tr);
    var value = getTableAsJSON(right);
    obj[key] = value;

    console.log(right);
    console.log(value);
    console.log("Key: " + key + " Value: " + value)
  }

  // tr.type == "none"
  else if (tr.type == "none")
    // yikes
    continue;
  }
  */
  }

  return obj;
}

function getRowAsObj(tr, parentKey, parentArr) {
  var obj = {};
  if (tr.type == "string") {
    var key = getKey(tr);
    var right = getRight(tr);
    var value = getValue(right);
    obj[key] = value;
  }

  else if (tr.type == "array") {
    var arr = [];
    var entries = getRight(tr).children; // rows in array
    // console.log(entries);
    var key = getKey(tr);
    // length - 1 because the last row is just the add button.
    for (var i = 0; i < entries.length - 1; i++) {
      // Get a obj from each row and push to arr.
      // Convert each row to an obj.
      var objEntry = getRowAsObj(entries[i], key, arr);
      // arr.push(objEntry); // handled by above
    }
    // console.log("arr:")
    // console.log(arr)
    obj[key] = arr;
  }

  else if (tr.type == "array_entry") {
    var key = parentKey;
    var right = getRight(tr);
    var value = getTableAsObj(right); // recursive call for objects in array
    if (value.value == undefined) {
      value = right.value; // Just a single text box, no need for recursion.
    }
    parentArr.push(value);
    // console.log(obj);

  }

  else if (tr.type == "object") {
    var key = getKey(tr);
    var right = getRight(tr);
    var value = getTableAsObj(right);
    obj[key] = value;
  }
  return obj;
}

// =================== Simple helpers =============================
// Returns the string representing the key of this row (left element)
function getKey(row) {
  entries = row.children;
  if (entries.length != 2) {
    console.log("Error: row does not contain 2 elements");
  }
  return entries[0].textContent;
}

// Returns the right element in a row, representing the value.
// Strips away the enclosing td and returns only the first value within
function getRight(row) {
  entries = row.children;
  if (entries.length != 2) {
    console.log("Error: row does not contain 2 elements");
  }
  return entries[1].children[0];
}

// Returns the value stored within a right-handed component's text input.
// Assumes that the right-handed component is a simple text input,
// and fails horribly otherwise.
function getValue(right) {
  return right.value;
}

function newlines(num) {
  var div = document.createElement("div");
  for (var i = 0; i < num; i++) {
    var br = document.createElement("br");
    div.appendChild(br);
  }
  return div;
}

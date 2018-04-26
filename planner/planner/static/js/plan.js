// Counter for distributing unique element IDs (UIDs)
var UID_count = 0;

// Initial function called to setup HTML elements, listeners, etc.
function plan_init() {
  var courseSearchBox = $("#courseSearch")[0];
  courseSearchBox.addEventListener("keyup", keyEventHandler);

  var programSearchBox = $("#programSearch")[0];
  programSearchBox.addEventListener("keyup", keyEventHandler);

}

// ============================== EVENT HANDLERS =========================
// Handles keyup events for search boxes.
function keyEventHandler(event) {
  var key = event.key;

  // TODO check who called the keyeventhandler.
  if (this.id == "courseSearch" && isConsiderableKey(key)) {
    courseSearchSubmit();
  }
  else if (this.id == "programSearch" && isConsiderableKey(key)) {
    programSearchSubmit();
  }
}

// Called when program search results are clicked.
function programResultHandler(event) {
  // Add clicked major to selected majors list.
  var tr = this.cloneNode(true);
  var table = $("#currentProgramsTable")[0];
  var tableBody = table.children[0]; // make sure [0] correct
  var allRows = tableBody.children;

  // Disallow duplicate listings.
  for (var i = 0; i < allRows.length; i++) {
    if (allRows[i].innerHTML == tr.innerHTML) {
      return;
    }
  }

  // Add the course to the list of enrolled courses
  tableBody.appendChild(tr);


  // BUG: Should not append to this div (it's nested too deeply)
  // Create and add an accordion for this class.
  var target = $("#programInfoDiv")[0];
  var accordion = createAccordion(JSON5.parse(this.obj_data));
  target.appendChild(accordion);

  // Reinitialize all popovers.
  $("[data-toggle=popover]").popover();
}

// Called when course search results are clicked.
function courseResultHandler(event) {

  // Add the clicked course to the enrolled courses list
  var tr = this.cloneNode(true);
  var table = $("#currentCoursesTable")[0];
  var tableBody = table.children[0]; // make sure [0] correct
  var allRows = tableBody.children;

  // Disallow duplicate listings.
  for (var i = 0; i < allRows.length; i++) {
    if (allRows[i].innerHTML == tr.innerHTML) {
      return;
    }
  }

  // Add the course to the list of enrolled courses
  tableBody.appendChild(tr);


  // Make a post request for the given table and fetch via python OR
  // cache results of search locally and do it in JS.
  // I like the JS idea because JSON support will be better,
  // along with native DOM integration.
}


// Return true if we'd like to respond to this key being pressed; else false.
// TODO make space a considerable key!!
function isConsiderableKey(key) {
    return ((key >= '0' && key <= '9') |
            (key >= 'a' && key <= 'z') |
            (key >= 'A' && key <= 'Z') |
            (key == "Space") |
            (key == "Backspace"));
}

// ============================= POST SUBMITTERS =======================
/* Function called on keystroke to send an XHR request to the server
 * and await a reply.
 * Note that currently manual form submission is not bound to this
 * TODO bind manual submission here instead
 */
function courseSearchSubmit() {
  var courseSearchForm = $("#courseSearchForm");
  $.post('/plan.html',
         courseSearchForm.serialize(),
         updateCourseResults
       );
}

/* Function to take in a jsonResponse string from an XHR request and to
 * process that json into an HTML <ul> element, then display
 * the final result on the DOM.
 */
function updateCourseResults(jsonResponse) {
  updateResults(jsonResponse, "course");
}

// XHR POST handling function for program searches.
function programSearchSubmit() {
  var programSearchForm = $("#programSearchForm");
  $.post('/plan.html',
         programSearchForm.serialize(),
         updateProgramResults
       );
}

// Function for displaying results.
function updateProgramResults(jsonResponse) {
  updateResults(jsonResponse, "program");
}

function updateResults(jsonResponse, type) {
  // Preprocess the JSON response so it is suitable for parsing
  results = parseJSON(jsonResponse);

  var resultsTableID = "#" + type + "SearchResults";
  var resultsHeaderID = "#" + type + "SearchHeader";

  // Create the results header
  var resultHeading = document.createElement("h3");
  var numResults = results.length;

  var label = null;
  if (numResults == 1) label = text(numResults + " Search Result");
  else                 label = text(numResults + " Search Results");

  resultHeading.appendChild(label);

  resultTableDiv = createResultsTable(results, type);

  // Clear old results, and insert new ones.
  // NOTE dangerous--accidentaly variable overload!
  results = $(resultsTableID);
  results.empty();
  results[0].appendChild(resultTableDiv);

  resultsHeaderDiv = $(resultsHeaderID);
  resultsHeaderDiv.empty();
  resultsHeaderDiv[0].appendChild(resultHeading);
}



// ======================== CREATOR FUNCTIONS ==============================
// GIven a parsed JSON object, return a table to
// display the results.
function createResultsTable(resultsObj, resultsType) {

  // Create the results elements
  var resultTableDiv = document.createElement("div");
  resultTableDiv.id = "course-table-scroll";
  var resultTable = document.createElement("table");
  var resultTableBody = document.createElement("tbody");

  // Add them to each other
  resultTableDiv.appendChild(resultTable);
  resultTable.appendChild(resultTableBody);


  // Generate a table row + entry for each search result.
  for (var i = 0; i < resultsObj.length; i++) {
    // Create elements for each row
    var tr = createTableRow(results[i], resultsType);
    resultTableBody.appendChild(tr);
  }

  return resultTableDiv;
}

function createTableRow(result, resultsType) {
  var tr = document.createElement("tr");
  var td = document.createElement("td");

  // Assign type-specific elements and attributes.
  var label = null;
  // Create course-type labels.
  if (resultsType == "course") {
    label = text(createCourseTag(result));
    tr.addEventListener("click", courseResultHandler);
  }
  // Create program-type labels.
  else if (resultsType = "program") {
    label = text(createProgramTag(result));
    tr.addEventListener("click", programResultHandler);
    tr.obj_data = JSON5.stringify(result);

  }

  // Add elements to each other
  td.appendChild(label);
  tr.appendChild(td);
  return tr;
}

/*
 * Creates an accordion based on a JSON for each major
 */
function createAccordion(resultsObj) {

    // Create the results elements
    var resultDiv = document.createElement("div");
    resultDiv.classList.add("col-sm-2");
    resultDiv.classList.add("text-left");

    // Creates header
    var majorHeader = document.createElement("h3");
    var majorName = document.createTextNode(resultsObj["name"]);
    majorHeader.appendChild(majorName);
    // Appends
    resultDiv.appendChild(majorHeader);

    // Creates accordion div
    var accordionDiv = document.createElement("div");
    accordionDiv.style.float = "left";
    accordionDiv.classList.add("panel-group");
    accordionDiv.id = "accordion";
    // Appends
    resultDiv.appendChild(accordionDiv);

    // Creates panel div
    var panelDiv = document.createElement("div");
    panelDiv.classList.add("panel");
    panelDiv.classList.add("panel-default");
    // Appends
    accordionDiv.appendChild(panelDiv);

    // Generate a row for each requirements
    for (var i = 0; i < resultsObj["requirements"].length; i++) {
        // Create panel heading
        var panelHeading = document.createElement("div");
        panelHeading.classList.add("panel-heading");
        // append
        panelDiv.appendChild(panelHeading);

        // Create panel tile
        var panelTitle = document.createElement("h4");
        panelTitle.classList.add("panel-title");
        // append
        panelHeading.appendChild(panelTitle);

        // Assign a UID
        var uid = UID();

        // Create accordion toggle
        var collapseToggle = document.createElement("a");
        collapseToggle.classList.add("accordion-toggle");
        collapseToggle.classList.add("collapsed");
        collapseToggle.setAttribute("data-toggle", "collapse");
        collapseToggle.setAttribute("href", "#collapse" + uid);
        collapseToggle.appendChild(text(resultsObj["requirements"][i]["type"]));
        // append
        panelTitle.appendChild(collapseToggle);

        /* ------------------------------------------------------ */

        // Create panel collapse
        var panelCollapse = document.createElement("div");
        panelCollapse.id = "collapse" + uid;
        panelCollapse.classList.add("panel-collapse");
        panelCollapse.classList.add("collapse");
        // Append
        panelDiv.appendChild(panelCollapse);

        // Create dropdown body
        for (var j = 0; j < resultsObj["requirements"][i]["number"]; j++) {
            // Create panel body
            var panelBody = document.createElement("div");
            panelBody.classList = "panel-body";
            // Append
            panelCollapse.appendChild(panelBody);

            // Create icon
            var icon = document.createElement("span");
            icon.classList.add("glyphicon");
            icon.classList.add("glyphicon-search");
            icon.classList.add("icon-bad");
            icon.classList.add("pull-right");
            // Append
            panelBody.appendChild(icon);

            // Create popover
            var popover = document.createElement("a");
            popover.style.cursor = "pointer";
            popover.setAttribute("data-toggle", "popover");
            popover.setAttribute("title", "Potential courses");
            popover.setAttribute("data-html", "true");
            var dataContent = resultsObj["requirements"][i]["courses"][0];
            for (var k = 1; k < resultsObj["requirements"][i]["courses"].length; k++) {
                dataContent += "<br />";
                dataContent += resultsObj["requirements"][i]["courses"][k];
            }
            popover.setAttribute("data-content", dataContent);
            popover.appendChild(text("Find a course!"));

            // Append
            panelBody.appendChild(popover);

        }
    }

    return resultDiv;
}


// =========================== HELPER FUNCTIONS =========================

function parseJSON(jsonResponse) {
  // Preprocess the JSON response so it is suitable for parsing
  jsonResponse = jsonResponse.replace(/ObjectId\((['"].*?['"])\)/g, "$1");

  //  these few should be unnecessary as it's technically a bug in the data.
  jsonResponse = jsonResponse.replace(/False/g, "false");
  jsonResponse = jsonResponse.replace(/None/g, "null");

  results = JSON5.parse(jsonResponse);
  return results;
}

/*
 * Return a string of the form COS333 for the given json entry
 */
function createCourseTag(courseJSON) {
    var listings = courseJSON['listings'];
    var listingArr = [];
    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      listingArr.push(listing['dept'] + listing['number']);
    }
    // return listingArr[0];
    return listingArr.join(" / ");
}

/* Create a string containing name of major for given json entry
 */
function createProgramTag(programJSON) {
  var tag = programJSON['name'];
  if (programJSON.track) {
    tag += " - " + programJSON['track'];
  }
  return tag;
}

/*
 * Creates a DOM child text node containing the given str
 */
function text(str) {
  return document.createTextNode(str);
}

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

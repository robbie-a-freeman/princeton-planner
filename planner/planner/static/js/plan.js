// ================== GLOBAL VARIABLES =================================
// Counter for distributing unique element IDs (UIDs)
var UID_count = 0;

// ====================== INITIALIZERS =================================
// Initial function called onload to setup HTML elements, listeners, etc.
function plan_init() {
  var courseSearchBox = $("#courseSearch")[0];
  courseSearchBox.addEventListener("keyup", keyEventHandler);

  var programSearchBox = $("#programSearch")[0];
  programSearchBox.addEventListener("keyup", keyEventHandler);

  loadUserData();
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

  var target = $("#programInfoDiv")[0];
  var accordion = createAccordion(JSON5.parse(this.obj_data));
  target.appendChild(accordion);

  // Reinitialize all popovers.
  $("[data-toggle=popover]").popover();
}

// Called when course search results are clicked.
function courseResultHandler(event) {

  // Add the clicked course to the enrolled courses list
  var tr = document.createElement("tr");
  var td = this.cloneNode(true);
  var table = $("#currentCoursesTable")[0];
  var tableBody = table.children[0]; // make sure [0] correct
  var allRows = tableBody.children;

  // Disallow duplicate listings.
  // TODO make more rigorous; this is buggy
  for (var i = 0; i < allRows.length; i++) {
    if (allRows[i].children[0].innerHTML == td.innerHTML) {
      return;
    }
  }

  tr.appendChild(td);
  // Add the course to the list of enrolled courses
  tableBody.appendChild(tr);


  // Make a post request for the given table and fetch via python OR
  // cache results of search locally and do it in JS.
  // I like the JS idea because JSON support will be better,
  // along with native DOM integration.
}

// Called when info button next to search results is clicked.
function courseInfoHandler(event) {

  // Pop up with the extra info
  console.log("HEELO");

}


// ============================= POST SUBMITTERS =======================
/* Function called on keystroke to send an XHR request to the server
 * and await a reply.
 * Note that currently manual form submission is not bound to this
 * TODO bind manual submission here instead
 */
function courseSearchSubmit() {
  var courseSearchForm = $("#courseSearchForm");
  $.post('/plan',
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
  $.post('/plan',
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


// Set the current semester, and change current courses/database.
function updateSemester(semester) {


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
    // Create info button.
    var infoBut = createInfoButton();

    // Create label and onclick listener
    label = text(createCourseTag(result));
    td.addEventListener("click", courseResultHandler); // note td
  }
  // Create program-type labels.
  else if (resultsType = "program") {
    label = text(createProgramTag(result));
    tr.addEventListener("click", programResultHandler); // note tr
  }

  // Cache database information to reduce future queries.
  tr.obj_data = JSON5.stringify(result);

  // Add elements to each other
  td.appendChild(label);
  tr.appendChild(td);

  // Add infobutton if needed.
  if (resultsType == "course") {
    td.appendChild(infoBut);
  }

  return tr;
}

// Creates a "more info" button for a single course search result
function createInfoButton() {
  var infoBut = document.createElement("span");
  infoBut.classList.add("glyphicon");
  infoBut.classList.add("glyphicon-question-sign");
  infoBut.addEventListener("click", courseInfoHandler);
  infoBut.style.float="right";
  return infoBut;
}

// ==================== ACCORDION CREATORS ==================================
/* Creates an accordion based on a JSON object resultsObj  */
function createAccordion(resultsObj) {
    var requirements = resultsObj["requirements"];

    // Create the results elements
    var resultDiv = document.createElement("div");
    resultDiv.classList.add("col-sm-2");
    resultDiv.classList.add("text-left");

    // Creates + appends header
    var majorHeader = document.createElement("h3");
    var majorName = document.createTextNode(resultsObj["name"]);
    majorHeader.appendChild(majorName);
    resultDiv.appendChild(majorHeader);

    // Creates + appends accordion div
    var accordionDiv = document.createElement("div");
    accordionDiv.style.float = "left";
    accordionDiv.classList.add("panel-group");
    accordionDiv.id = "accordion";
    resultDiv.appendChild(accordionDiv);

    // Creates + appends panel div
    var panelDiv = document.createElement("div");
    panelDiv.classList.add("panel");
    panelDiv.classList.add("panel-default");
    accordionDiv.appendChild(panelDiv);

    // Generate a row for each requirements
    for (var i = 0; i < requirements.length; i++) {
        var requirement = requirements[i];
        createAccordionTitle(requirement, panelDiv);
    }
    return resultDiv;
}

// Create an expandable hedaer row for a single requirement in an accordion
function createAccordionTitle(requirement, panelDiv) {
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

  // Create + append accordion toggle
  var collapseToggle = document.createElement("a");
  collapseToggle.classList.add("accordion-toggle");
  collapseToggle.classList.add("collapsed");
  collapseToggle.setAttribute("data-toggle", "collapse");
  collapseToggle.setAttribute("href", "#collapse" + uid);
  collapseToggle.appendChild(text(requirement["type"]));
  panelTitle.appendChild(collapseToggle);

  // Create an accordion body for this requirement.
  panelDiv.append(createAccordionBody(requirement, uid));
}

// Create a single row of the expandable dropdown content for an accordion
// requirement header
function createAccordionBody(requirement, uid) {
    // Create panel collapse
    var panelCollapse = document.createElement("div");
    panelCollapse.id = "collapse" + uid;
    panelCollapse.classList.add("panel-collapse");
    panelCollapse.classList.add("collapse");

    // Create dropdown body
    for (var j = 0; j < requirement["number"]; j++) {
        // Create + append panel body
        var panelBody = document.createElement("div");
        panelBody.classList = "panel-body";
        panelCollapse.appendChild(panelBody);

        // Create + append icon.
        var icon = document.createElement("span");
        icon.classList.add("glyphicon", "glyphicon-search",
        "icon-bad",  "pull-right");
        panelBody.appendChild(icon);

        // Create + append popover.
        var popover = createAccordionPopover(requirement["courses"]);
        panelBody.appendChild(popover);
    }
    return panelCollapse;
}

// Create a popover for the given courseList data.
function createAccordionPopover(courseList) {
  // Create popover
  var popover = document.createElement("a");
  popover.style.cursor = "pointer";
  popover.setAttribute("data-toggle", "popover");
  popover.setAttribute("title", "Potential courses");
  popover.setAttribute("data-html", "true");
  var dataContent = courseList[0];
  for (var k = 1; k < courseList.length; k++) {
      dataContent += "<br />";
      dataContent += courseList[k];
  }
  popover.setAttribute("data-content", dataContent);
  popover.appendChild(text("Find a course!"));
  return popover;
}

// ==================== STRING CREATOR FUNCTIONS ========================
/* Return a string of the form COS 333 for the given json entry */
function createCourseTag(courseJSON) {
    var listings = courseJSON['listings'];
    var listingArr = [];
    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      listingArr.push(listing['dept'] + " " + listing['number']);
    }
    return listingArr.join(" / ");
}

/* Create a string containing name of major for given json entry*/
function createProgramTag(programJSON) {
  var tag = programJSON['name'];
  if (programJSON.track) {
    tag += " - " + programJSON['track'];
  }
  return tag;
}


// =========================== HELPER FUNCTIONS =========================
// Preprocess the given jsonResponse JSON string and parse it into a JSON object,
// which gets returned.
function parseJSON(jsonResponse) {
  // Preprocess the JSON response so it is suitable for parsing
  jsonResponse = jsonResponse.replace(/ObjectId\((['"].*?['"])\)/g, "$1");
  // jsonResponse = jsonResponse.replace(/True/g)
  results = JSON5.parse(jsonResponse);
  return results;
}

// Return true if we'd like to respond to this key being pressed; else false.
function isConsiderableKey(key) {
    return ((key >= '0' && key <= '9') |
            (key >= 'a' && key <= 'z') |
            (key >= 'A' && key <= 'Z') |
            (key == "Space") |
            (key == "Backspace"));
}

/* Creates a DOM child text node containing the given str */
function text(str) {
  return document.createTextNode(str);
}

// Convert num to base 36 (used for unique ID generation)
// Not strictly necessary but it makes everything look cooler.
function numToUID(num) {
  var b36str = num.toString(36);
  // Pad with 0 on left until 6 chars long.
  while (b36str.length < 6) {
    b36str = "0" + b36str;
  }
  return b36str;
}

// Generate and return a new UID guaranteed to be distinct from all
// previously generated UIDs created in this session.
function UID() {
  var uid = numToUID(UID_count);
  UID_count++;
  return uid;
}

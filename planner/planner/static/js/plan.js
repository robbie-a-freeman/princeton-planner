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

  // Unhide active semester
  updateCurrentSemester();

  loadUserData();
}

// Reinitialize all popovers.
function refreshPopovers() {
  $("[data-toggle=popover]").popover();
}

function hidePopovers() {
  $("[data-toggle='popover']").popover('hide');
}

function destroyPopovers() {
  $("[data-toggle='popover']").popover('destroy');
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

  // Prevent visual glitches
  hidePopovers();

  // Add clicked major to selected majors list.
  var tr = this.cloneNode(true);
  var td = tr.children[0];
  var table = $("#currentProgramsTable")[0];
  var tableBody = table.children[0]; // make sure [0] correct
  var allRows = tableBody.children;

  // Disallow duplicate listings.
  for (var i = 0; i < allRows.length; i++) {
    if (allRows[i].innerText == tr.innerText) {
      return;
    }
  }

  // Add the program to the list of enrolled programs, and give it a remove button
  tr.children[0].appendChild(createRemoveButton("program")); //td.appendChild...
  tableBody.appendChild(tr);

  var target = $("#programInfoDiv")[0];
  var accordionDiv = createAccordion(JSON5.parse(this.obj_data));
  target.appendChild(accordionDiv);

  // Update the accordion with all of the currently enrolled courses.
  var accordion = accordionDiv.children[1];
  var enrolledCourses = $(".enrolled-course-td");
  for (var i = 0; i < enrolledCourses.length; i++) {
    var courseToAddName = enrolledCourses[i].innerText;
    var courseToAddSem  = enrolledCourses[i].semester;
    var courseToAddObj  = createCourseObj(courseToAddName, courseToAddSem);
    addCourseToAccordion(courseToAddObj, accordion);
  }

  // Reinitialize all popovers.
  refreshPopovers();

  // Add the program to the database.
  addProgramToUser(getText(td));
}

// Called when course search results are clicked.
// semesterOverride is an optional argument to createTableRow (who assigns this handler)
// almost exclusively used to load the user's data from the DB into an arbitrary semester.
// Aside from this use case it should be avoided if possible.
function courseResultHandler(event) {

  // Prevent visual glitches
  hidePopovers();

  // Handle a manual override of semester (if the semesterOverride is provided by this td)
  semesterOverride = this.semesterOverride;
  var shortSemester = getShortSemester();
  if (semesterOverride != null) {
    shortSemester = semesterOverride;
  }

  // Add the clicked course to the enrolled courses list
  var tr = document.createElement("tr");
  var td = this.cloneNode(true);
  var table = getSemesterEnrolledTable(shortSemester);
  var tableBody = table.children[0]; // make sure [0] correct
  var allRows = tableBody.children;

  // Add the enrolled course class and semester to this td so it can be easily found later.
  td.classList.add("enrolled-course-td");
  td.semester = shortSemester;

  // Add a remove button
  td.appendChild(createRemoveButton("course"));

  // Get the name of the course that was added and create an Obj wrapper.
  var addedCourseName = td.innerText;
  var addedCourseObj = createCourseObj(addedCourseName, td.semester);

  // Disallow duplicate listings.
  // TODO make more rigorous; this is buggy
  for (var i = 0; i < allRows.length; i++) {
    if (allRows[i].children[0].innerHTML == td.innerHTML) {
      return;
    }
  }

  // Add the course to enrolled courses list
  tr.appendChild(td);
  tableBody.appendChild(tr);

  // Insert this course into the user database.
  addCourseToUser(addedCourseObj["name"], addedCourseObj["semester"]);

  addCourseToAccordions(addedCourseObj, getShortSemester());
}

// Called when info button next to search results is clicked.
function courseInfoHandler(event) {
  event.stopPropagation();
  // Pop up with the extra info
  console.log("HEELO");
  window.alert( event.target.myParam );

  /* var listings = courseJSON['listings'];
    var listingArr = [];
    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      listingArr.push(listing['dept'] + " " + listing['number']);
    }
    return listingArr.join(" / "); */

}

// Called when the remove course button is pressed.
function removeCourseHandler(event) {
  // Hide all popovers to avoid visual glitches.
  hidePopovers();

  // Prevent weird spurious click events from being generated in parents.
  event.stopPropagation();
  var tr = this.parentElement.parentElement; // span --> td --> tr

  // Update the GUI.
  removeEnrolledCourse(tr);

  // Update mongodb
  removeCourseFromUser(getText(tr.children[0]) , getShortSemester());
}

// Called when the remove program button is pressed.
function removeProgramHandler(event) {
  // Hide all popovers to avoid visual glitches.
  hidePopovers();

  // Prevent weird spurious click events from being generated in parents.
  event.stopPropagation();
  var tr = this.parentElement.parentElement; // span --> td --> tr

  // Remove course from enrolled list.
  tr.parentElement.removeChild(tr);

  // Remove associated accordion.
  var removedCourse = this.parentElement.innerText; // span--> td--> innerText
  var programInfoDiv = $("#programInfoDiv")[0];
  var accordionDivs = programInfoDiv.children;
  for (var i = 0; i < accordionDivs.length; i++) {
    var accordionDiv = accordionDivs[i];
    // if div --> h3 --> innerText is the course we're removing, remove the whole div
    if (accordionDiv.children[0].innerText == removedCourse) {
      programInfoDiv.removeChild(accordionDiv);
    }
  }

  // Update mongodb
  removeProgramFromUser(getText(tr.children[0]));
}

// Called when the semester dropdown changes value.
function semesterChangeHandler(event) {
  // Update the currently visible courses.
  updateCurrentSemester();

  // Refresh the search results.
  courseSearchSubmit();
}

// ======================== COURSE ENROLLING HELPERS ===================
// Used to update the accordions when needed.
// =====================================================================

// Given an obj addedCourse (containing name: and semester: )
// Update the accordions by adding the given course to all relevant accordions.
function addCourseToAccordions(addedCourse) {
  // Add selected courses to each major accordion.
  var accordions = $(".accordion");
  for (var i = 0; i < accordions.length; i++) {
    addCourseToAccordion(addedCourse, accordions[i]);
  }
}

// Given an obj addedCourse (containing name: and semester: )
// Add the given course to the given accordion, where accordion is an element
// with the class .accordion
function addCourseToAccordion(addedCourseObj, accordion) {

      // Get the collection of header/content pairs.
      var accordion = accordion.children[0];
      // Pray the DOM never changes.
      var progName = accordion.parentElement.parentElement.children[0].innerText;

      // A list of the DOM children of the accordion.
      var kids = accordion.children;
      var numReqs = kids.length / 2; // children.length always even.

      // Create a list of all requirements that addedCourse satisfies.
      var satisfiedReqs = [];

      // For each "requirement" category in this accordion:
      req_loop:
      for (var j = 0; j < numReqs; j++) {
        var reqName = kids[2 * j].children[0].children[0].innerText;
        var reqPanelHeading  = kids[2 * j];

        // A list of each "slot" into which courses can be added
        var subreqList = kids[2 * j + 1].children;

        // Iterate over all slots.
        // If the added course is in a subreq's popover,
        // Replace that subreq with the course name + checkmark + semester.
        for (var k = 0; k < subreqList.length; k++) {

          // If addedCourse in subreqlist's popover:
          // Store this subreq as a match, and check next req.
          var satisfiedCourse = satisfiesSubreq(addedCourseObj["name"], subreqList[k]);

          // If this subreq is satisfied by added course AND
          // this slot is not already filled with another course:
          if (satisfiedCourse != null && !("hiddenHTML" in subreqList[k])) {
            // Gather relevant information about course.
            var satisfiedDict = {};
            satisfiedDict["reqPanelHeading"] = reqPanelHeading;
            satisfiedDict["subreqList"] = subreqList;
            satisfiedDict["firstSatisfied"] = k;
            satisfiedDict["satisfiedCourse"] = satisfiedCourse[0];
            satisfiedDict["popoverString"] = satisfiedCourse[1];
            satisfiedReqs.push(satisfiedDict);
            break req_loop;
          }
        }
      }

      // We now have a list of all satisfied reqs for this program.
      // If there is only one satisfied req, add it.
      if (satisfiedReqs.length == 1) {
        addCourseToRequirement(addedCourseObj, satisfiedReqs[0]);
      }
      // More than one satisfied req! Ask user to disambiguate.
      else if (satisfiedReqs.length > 1){
        return; // TODO IMPLEMENT promptDisambiguation and remove this.
        // resolution object storing user choices
        // Let resolutionObj contain course, semester, program, requirement.
        var res = promptDisambiguation(addedCourseObj, satisfiedReqs);

        // this is likely totally borked even if it did work
        // Insert override into db
        addOverrideToUser(res["course"], res["semester"], res["program"], res["requirement"]);

        // Display the override locally. (add to enrolled courses list, update accordions
        // TODO
      }
}

// TODO combine this with matchCoursePopover.
// Is addedCourse present in the popover of subreq? (even if the popover is hidden)
// Return the matching course if so, or null if not.
// If subreq has no popover, return null. (unless the popover is hidden, see above)
function satisfiesSubreq(addedCourseStr, subreq) {
  // No popover exists.

  // If subreq has a lone (text) element and has no hidden popover, no match
  if (subreq.children.length < 1 && !("hiddenHTML" in subreq)) {
    return null;
  }

  var content;
  if ("hiddenHTML" in subreq) {
    content = subreq.hiddenHTML.match(/data-content="(.*?)"/)[1];
  }
  else {
    content = subreq.children[1].getAttribute("data-content");
  }
  var popoverCourses = content.split(/<br.?\/?>/g);
  var addedCourses = addedCourseStr.split(/ \/ /g);
  return (matchCoursePopover(addedCourses, popoverCourses));
}

// Given two lists of courses (courses + popover), does any course
// exist in both lists?
// If yes, Return a tuple s.t. [0] = matching course in course cross-listing,
//                             [1] = full matching string in popover
// or return null if does not exist in both.
// TODO COrner cases: "COS 397 | COS 398", or
//                    "COS >= 300", or
//                    "project required."
function matchCoursePopover(addedCourses, popoverCourses) {
  // if performance is an issue (it won't be), revise brute force algorithm
  for (var i = 0; i < addedCourses.length; i++) {
    for (var j = 0; j < popoverCourses.length; j++) {
      if (popoverCourses.includes(">")) {
        // TODO CORNER CASE HANDLING!!!
      }

      // Check for courses in popover that are "OR"d together
      // using .includes()
      if (popoverCourses[j].includes(addedCourses[i])) {
        return [addedCourses[i], popoverCourses[j]];
      }
    }
  }
  // No match found, return null.
  return null;
}

// Given an obj addedCourseObj (containing name: and semester: )
// and satisfiedReq dict containing
// info about the satisfied requirement, update the satisfiedReq's
// DOM elements to reflect the course being added.
// Use the string shortSemester to create a semester tag for the course.
function addCourseToRequirement(addedCourseObj, satisfiedReq) {
  var subreqList      = satisfiedReq["subreqList"];
  var firstSatisfied  = satisfiedReq["firstSatisfied"];
  var satisfiedCourse = satisfiedReq["satisfiedCourse"];
  var popoverString   = satisfiedReq["popoverString"];
  var reqPanelHeading = satisfiedReq["reqPanelHeading"];

  // Extract info from addedCourseObj
  var addedCourse = addedCourseObj["name"];
  var shortSemester = addedCourseObj["semester"];

  // Remove the popover link from the satisfied subreq list.
  // Replace it with the name of the satisfied course, plus (TODO) semester and checkmark.
  subreqList[firstSatisfied].hiddenHTML = subreqList[firstSatisfied].innerHTML;
  subreqList[firstSatisfied].innerHTML = '';
  subreqList[firstSatisfied].appendChild(text(satisfiedCourse));
  // Create and add a checkmark to the subreq.
  subreqList[firstSatisfied].appendChild(createCheckmark());

  // Get the current semester, and add a semester tag to the subreq.
  // TODO BUG make sure getShortSemester() will always be accurate --
  // it returns the CURRENT semester, not necessarily the one associated with
  // the satisfied course.
  subreqList[firstSatisfied].appendChild(createSemesterTag(shortSemester));

  // For all subreqs in subreqList, strikethrough satisfiedCourse from the popover.
  // (Check .popoverHTML if it exists. )
  // TODO
  for (var i = 0; i < subreqList.length; i++) {
    var children = subreqList[i].children;

    // Use the hidden popover data by default (if popover is hidden)
    var popover = subreqList[i].hiddenHTML;
    var hidden = true;

    // If the popover is still active, use the active popover data instead.
    // If subreqList[i] has an <a> child, we know it's still active.
    for (var j = 0; j < children.length; j++) {
      if (children[j].tagName.toLowerCase() == "a") {
        hidden = false;
        popover = subreqList[i].innerHTML;
        break; // no need to keep looking.
      }
    }

    // Strikethrough the satisfiedCourse in popoverHTML, then put it back.
    var re = new RegExp("(" + popoverString+ ")", "g");
    popover = popover.replace(re, "<s>$1</s>" );

    // If hidden, put back into hiddenHTML.
    if (hidden) {
      subreqList[i].hiddenHTML = popover;
    }
    else {
      subreqList[i].innerHTML = popover;
    }

  }

  incrementHeading(reqPanelHeading);
  refreshPopovers();

  // Bring attention to the updated requirement.
  flash(reqPanelHeading);

}

// Ask user for clarification when a course has multiple reqs
// it could satisfy, and add course to the desired areas.
function promptDisambiguation(addedCourse, satisfiedReqs) {
  console.log("promptDisambiguation called but not implemented!");
}

// ========================= COURSE REMOVING HELPERS ======================

// Remove the course from the enrolled courses pane, and from any
// accordions in which it is present.
// TODO database integration.
function removeEnrolledCourse(tr) {

  // Remove from enrolled courses pane.
  tr.parentElement.removeChild(tr);

  // TODO Remove from every accordion.
  removeCourseFromAccordions(tr.children[0].innerText);
}

// Update the accordions by removing the given course from all relevant accordions.
// NOTE Shares a lot of code with addCourseToAccordions; consider refactoring
// documentation: the .hiddenHTML attribute oof a subreq element
// exists ONLY if that subreq is currently filled by an assigned course.
// It is removed as soon as the course filling this requirement is removed.
function removeCourseFromAccordions(removedCourse) {

  // Remove selected courses from each major accordion.
  var accordions = $(".accordion");
  for (var i = 0; i < accordions.length; i++) {

    // Get the collection of header/content pairs.
    var accordion = accordions[i].children[0];
    // Pray the DOM never changes.
    var progName = accordion.parentElement.parentElement.children[0].innerText;

    // A list of the DOM children of the accordion.
    var kids = accordion.children;
    var numReqs = kids.length / 2; // children.length always even.

    // For each "requirement" category in this accordion:
    req_loop:
    for (var j = 0; j < numReqs; j++) {
      var reqName = kids[2 * j].children[0].children[0].innerText;

      // A list of each "slot" into which courses can be added
      var subreqList = kids[2 * j + 1].children;
      var courseWasRemoved = false;

      // Iterate over all slots.
      // In each slot's popover info, un-strikethrough the removed course.
      // If removed course is in subreq's innerText, replace it with a new
      // "Find a Course!" popover element.
      for (var k = 0; k < subreqList.length; k++) {

        // unstrikethrough the removed course in this slot's popover.
        unstrikethrough(removedCourse, subreqList[k]);

        // if this slot's innerText is contained within the removedCourse string,
        // Replace the innerHTML with a fresh findacourse popover (from hiddenHTML);
        // Then delete hiddenHTML.
        if (removedCourse.includes(getText(subreqList[k]))) {
          subreqList[k].innerHTML = subreqList[k].hiddenHTML;
          delete subreqList[k].hiddenHTML;
          courseWasRemoved = true;
        }
      }
      if (courseWasRemoved) {
        decrementHeading(kids[2 * j]);
        flash(kids[2 * j]);
      }
    }
  }
  // Reinitialize the popovers.
  refreshPopovers();
}

// Given a course name and a subreq from an accordion, which contains popover data,
// modify the popover data to ensure that that courses matching courseName are not struck out.
function unstrikethrough(courseName, subreq) {
  var matchInfo = satisfiesSubreq(courseName, subreq);

  // This course isn't present in subreq; nothing left to do!
  if (matchInfo == null) return;

  var satisfiedCourse = matchInfo[0]; // Which cross listing matched?
  var popoverString = matchInfo[1];   // Full string in the popover. (including html tags)

  // An ugly way of removing the <s> </s> tags from the name string. (redo if time)
  popoverString = popoverString.replace(/<.*?>/g, "");

  var children = subreq.children;

  // Use the hidden popover data by default (if popover is hidden)
  var popover = subreq.hiddenHTML;
  var hidden = true;

  // If the popover is still active, use the active popover data instead.
  // If subreqList[i] has an <a> child, we know it's still active.
  for (var j = 0; j < children.length; j++) {
    if (children[j].tagName.toLowerCase() == "a") {
      hidden = false;
      popover = subreq.innerHTML;
      break; // no need to keep looking.
    }
  }

  // Strikethrough the satisfiedCourse in popoverHTML, then put it back.
  var re = new RegExp("<s>(" + popoverString+ ")</s>", "g");
  popover = popover.replace(re, "$1" );

  // If hidden, put back into hiddenHTML.
  if (hidden) {
    subreq.hiddenHTML = popover;
  }
  else {
    subreq.innerHTML = popover;
  }
}


// ============================= POST SUBMITTERS =======================
/* Function called on keystroke to send an XHR request to the server
 * and await a reply.
 * Note that currently manual form submission is not bound to this
 * TODO bind manual submission here instead
 */
function courseSearchSubmit() {
  updateTimestamps();
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
  updateTimestamps();
  var programSearchForm = $("#programSearchForm");
  $.post('/plan',
         programSearchForm.serialize(),
         updateProgramResults
       );
}

// Set the timestamps of the searches.
function updateTimestamps() {
  $(".timestamp").val(new Date().getTime());
}


// ========================= SEARCH FUNCTIONS ==================================
// Function for displaying results.
function updateProgramResults(jsonResponse) {
  updateResults(jsonResponse, "program");
}

function updateResults(jsonResponse, type) {
  // Preprocess the JSON response so it is suitable for parsing
  var rawResults = parseJSON(jsonResponse);
  var results = rawResults["results"];
  var newTime = rawResults["time"];
  var oldTime = null;

  var resultsTableID = "#" + type + "SearchResults";
  var resultsHeaderID = "#" + type + "SearchHeader";
  var resultsTable = $(resultsTableID)[0];

  if ("timestamp" in resultsTable) {
    oldTime = resultsTable.timestamp;
  }
  // If this new timestamp is newer than the current one (prevent race condition)
  if (oldTime == null || newTime > oldTime) {
    resultsTable.timestamp = newTime;
  }
  else {
    // This server response is outdated. don't use it.
    return;
  }

  // Create the results header
  var resultHeading = document.createElement("h3");
  var numResults = results.length;

  var label = null;
  if (numResults == 1) label = text(numResults + " Search Result");
  else                 label = text(numResults + " Search Results");

  resultHeading.appendChild(label);

  resultTableDiv = createResultsTable(results, type);

  // Clear old results, and insert new ones.
  var resultsTable = $(resultsTableID);
  resultsTable.empty();
  resultsTable[0].appendChild(resultTableDiv);

  resultsHeaderDiv = $(resultsHeaderID);
  resultsHeaderDiv.empty();
  resultsHeaderDiv[0].appendChild(resultHeading);
}


// Set the current semester, and change current courses/database.
function changeSemester(semester) {


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
    var tr = createTableRow(resultsObj[i], resultsType);
    resultTableBody.appendChild(tr);
  }

  return resultTableDiv;
}

// Create a table row representing the given result, and give it the attributes
// and event handler associated with the given resultsType ("course" or "program").
// semesterOverride should not be provided except in rare situations, such as
// reloading courses from the database.
// semesterOverride has no effect unless type is "courses"
function createTableRow(result, resultsType, semesterOverride) {
  var tr = document.createElement("tr");
  var td = document.createElement("td");

  // Assign type-specific elements and attributes.
  var label = null;
  // Create course-type labels.
  if (resultsType == "course") {
    // Create info button.
    var infoBut = createInfoButton(result);

    // Create label and onclick listener
    label = text(createCourseTag(result));
    td.addEventListener("click", courseResultHandler); // note td
    td.semesterOverride = semesterOverride; // if not provided, will be undefined
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
function createInfoButton(courseJSON) {
    var infoBut = document.createElement("a");
    var address = "https://www.princetoncourses.com/course/";
    if (getSemester() == "Fall 2018") {
        address += "1192";
    }
    else if (getSemester() == "Spring 2018") {
        address += "1184";
    }
    else if (getSemester() == "Fall 2017") {
        address += "1182";
    }
    else if (getSemester() == "Spring 2017") {
        address += "1174";
    }
    else if (getSemester() == "Fall 2016") {
        address += "1172";
    }
    else if (getSemester() == "Spring 2016") {
        address += "1164";
    }
    else if (getSemester() == "Fall 2015") {
        address += "1162";
    }
    else if (getSemester() == "Spring 2015") {
        address += "1154";
    }
    else if (getSemester() == "Fall 2014") {
        address += "1152";
    }
    else if (getSemester().includes("Fall")) {
        address += "1192";
    }
    else if (getSemester().includes("Spring")) {
        address += "1184";
    }
    address += courseJSON["courseid"];
    infoBut.setAttribute("href", address);
    infoBut.setAttribute("target", "_blank");
    infoBut.style.cssFloat = "right";
    infoBut.style.padding = "0px";

    icon = document.createElement("span");
    icon.classList.add("glyphicon");
    icon.classList.add("glyphicon-share");
    icon.style.padding = "0px";
    icon.style.margin = "0px 0px 0px 5px";
    infoBut.appendChild(icon);

    return infoBut;

}

// Creates a "remove" button for a single course search result
// If type is "course", add the remove course listener.
// If type is "program" add the remove program listener.
function createRemoveButton(type) {
  var remBut = document.createElement("span");
  remBut.classList.add("glyphicon");
  remBut.classList.add("glyphicon-remove");
  if (type == "course") {
    remBut.addEventListener("click", removeCourseHandler);
  }
  else if (type == "program") {
    remBut.addEventListener("click", removeProgramHandler);
  }
  remBut.style.float="right";
  /*remBut.style.color="#ff7373";*/
  remBut.style.cursor="pointer";
  return remBut;
}

// Create and return a checkmark glyph.
function createCheckmark() {
  var check = document.createElement("span");
  check.classList.add("glyphicon", "glyphicon-ok", "icon-good", "pull-right");
  return check;
}

// Create a stylized element containing the given semester id
function createSemesterTag(shortSemester) {
  var span = document.createElement("span");
  span.appendChild(text(shortSemester));
  span.classList.add("semester-tag", "pull-right");
  return span;
}

// ==================== SEMESTER FUNCTIONS ==================================
function updateCurrentSemester() {
  // Hide all semesters.
  $(".coursesDiv").addClass("hidden");

  // Unhide current semester.
  getSemesterEnrolledCourses().classList.remove('hidden');
}

// ==================== ACCORDION CREATORS ==================================
/* Creates an accordion based on a JSON object resultsObj  */
function createAccordion(resultsObj) {
    var requirements = resultsObj["requirements"];

    // Create the results elements
    var resultDiv = document.createElement("div");
    resultDiv.classList.add("apple");

    // Creates + appends header
    var majorHeader = document.createElement("div");
    majorHeader.classList.add("mango");
    var majorName = text(createProgramTag(resultsObj));
    majorHeader.appendChild(majorName);
    resultDiv.appendChild(majorHeader);

    // Creates + appends accordion div
    var accordionDiv = document.createElement("div");
    accordionDiv.style.float = "left";
    accordionDiv.classList.add("panel-group", "accordion");
    accordionDiv.id = "accordion"; // BUG ids should be unique in document.
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
  collapseToggle.appendChild(text(requirement["type"]))

  var ratio = document.createElement("span");
  ratio.appendChild(text(" (0 / " + requirement["number"] + ")"));
  collapseToggle.appendChild(ratio);
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
// Get the innerText of an HTML element, without any of the text of its nested children.
function getText(element) {
  return element.childNodes[0].nodeValue;
}

// Gets the currently active semester, as a full string
function getSemester() {
  return $("#semester")[0].value;
}

// Gets the currently active semester, in abbreviated form.
// The first letter will be F for Fall or S for Spring, and
// the last two letters will be the final digits of the year (e.g. 18 for 2018)
function getShortSemester() {
  var semester = getSemester();
  var n = semester.length;
  var tag = semester.substring(0, 1) + semester.substring(n-2, n);
  return tag.toUpperCase();
}

// Get the currently active semester's enrolled courses div
function getSemesterEnrolledCourses() {
  var shortSemester = getShortSemester();
  var divID = "#coursesDiv" + shortSemester;
  return $(divID)[0];
}

// Get the currently active semester's enrolled courses table
// If a semesterOverride is provided, get that semester's courses table instead
// of the currently selected one.
function getSemesterEnrolledTable(semesterOverride) {
  var shortSemester = getShortSemester();
  if (semesterOverride != null) {
    shortSemester = semesterOverride;
  }
  var tableID = "#coursesTable" + shortSemester;
  return $(tableID)[0];
}

// Flash the given element on and off for visual effects
function flash(target) {
  if (LOADING_FROM_DB) return;
  var ms = 250;
  var num = 5;
  for (var i = 0; i < num; i++) {
    $(target).fadeIn(ms).fadeOut(ms);
  }
  $(target).fadeIn(ms);
}

// Create a courseObj containing the given name and semester.
function createCourseObj(name, semester) {
  return {"name": name, "semester":semester};
}


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
            (key == " ") |
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

function incrementHeading(panelObj) {
    var string = panelObj.children[0].children[0].innerHTML;
    var pieces = string.split("<span>");
    var morepieces = pieces[1].substring(2).split(" ");
    var newnumber = (parseInt(morepieces[0])+1).toString();
    var newString = pieces[0] + "<span> (" + newnumber + " " + morepieces[1] + " " + morepieces[2];
    panelObj.children[0].children[0].innerHTML = newString;
}

function decrementHeading(panelObj) {
    var string = panelObj.children[0].children[0].innerHTML;
    var pieces = string.split("<span>");
    var morepieces = pieces[1].substring(2).split(" ");
    var newnumber = (parseInt(morepieces[0])-1).toString();
    var newString = pieces[0] + "<span> (" + newnumber + " " + morepieces[1] + " " + morepieces[2];
    panelObj.children[0].children[0].innerHTML = newString;
}

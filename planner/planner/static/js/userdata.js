var USER_DATA;
var LOADING_FROM_DB = true;

// ======================== SAVE LOAD FUNCTIONS ==============================

// Loads the user data for the current CAS user.
function loadUserData() {
  // Ignore guests (don't add info to database)
  if (PLAN_PATH == "/guest_plan") return;
  $.get(DATA_PATH, renderUserData)
}

// Receives the user data for the current CAS user.
function renderUserData(jsonResponse) {
  var userdata = parseJSON(jsonResponse);
  USER_DATA = userdata;

  var programs = userdata["programsInfo"];
  for (var i = 0; i < programs.length; i++) {
    var tr_obj = createTableRow(programs[i], "program");
    tr_obj.click();
  }

  // Naive; incorrect! Need to consider the semester to which this course belongs.
  var semesters = userdata["coursesInfo"];
  for (var i = 0; i < semesters.length; i++) {
    var semester = semesters[i]["semester"];
    var courses = semesters[i]["courses"];
    for (var j = 0; j < courses.length; j++) {
      var tr_obj = createTableRow(courses[j], "course", semester);
      // The td has the onclick handler, not the tr.
      tr_obj.children[0].click();
    }
  }

  // Done loading data; set LOADING_FROM_DB back to false to enable flashing
  LOADING_FROM_DB = false;
}

// ========================= DB ADD/REMOVE FUNCTIONS ==================================
// XHR POST handling function for adding courses
// Requires the course name (COS 333), and semester in which it was taken.  (F18)
function addCourseToUser(course, semester) {
  var dict = {
    "form_name": "COURSE_ADD",
    "course_add": course,
    "semester": semester
  }
  $.post(PLAN_PATH,
         serialize(dict),
         callbackAddCourseToUser
       );
}

// XHR POST handling function for removing courses
// Requires the course name (COS 333), and semester in which it was taken.  (F18)
function removeCourseFromUser(course, semester) {
  var dict = {
    "form_name": "COURSE_REMOVE",
    "course_remove": course,
    "semester": semester
  }
  $.post(PLAN_PATH,
         serialize(dict),
         callbackRemoveCourseFromUser
       );
}

// XHR POST handling function for adding override courses.
// Requires the course name, semester in which it was taken,
// program satisfied, and which requirement of that program was satisfied.
function addOverrideToUser(course, semester, program, requirement) {
  var dict = {
    "form_name": "OVERRIDE_ADD",
    "override_add": course,
    "semester": semester,
    "program": program,
    "category": requirement // in the backend, "requirement" is referred to as "category".
  }
  $.post(PLAN_PATH,
         serialize(dict),
         callbackAddOverrideToUser
       );
}

// XHR POST handling function for removing override courses.
// Requires the course name, semester in which it was taken,
// program satisfied, and which requirement of that program was satisfied.
function removeOverrideFromUser(course, semester, program, requirement) {
  var dict = {
    "form_name": "OVERRIDE_REMOVE",
    "override_remove": course,
    "semester": semester,
    "program": program,
    "category": requirement // in the backend, "requirement" is referred to as "category".
  }
  $.post(PLAN_PATH,
         serialize(dict),
         callbackRemoveOverrideFromUser
       );
}

// XHR POST handling function for adding programs
// Requires the name of the program to add.
function addProgramToUser(program) {
  var dict = {
    "form_name": "PROGRAM_ADD",
    "program_add": program
  }
  $.post(PLAN_PATH,
         serialize(dict),
         callbackAddProgramToUser
       );
}

// XHR POST handling function for removing programs
// Requires the name of the program to remove.
function removeProgramFromUser(program) {
  var dict = {
    "form_name": "PROGRAM_REMOVE",
    "program_remove": program
  }
  $.post(PLAN_PATH,
         serialize(dict),
         callbackRemoveProgramFromUser
       );
}

// ================================ CALLBACK FUNCTIONS ==================================
// All callback functions are currently dummy functions to be defined if/when convenient
// in the future.

function callbackAddCourseToUser() {
}

function callbackRemoveCourseFromUser() {
}

function callbackAddProgramToUser() {
}

function callbackRemoveProgramFromUser() {
}

function callbackAddOverrideToUser() {
}

function callbackRemoveOverrideFromUser() {
}



// ========================= HELPER FUNCTIONS ================================
// Given a dictionary, return the string representing the serialized version of a form
// sharing the same structure as the dictionary.
function serialize(dict) {
  var keys = Object.keys(dict);
  var form = document.createElement("form");
  for (var i = 0; i < keys.length; i++) {
    var input = document.createElement("input");
    input.name = keys[i];
    input.value = dict[keys[i]];
    form.appendChild(input);
  }
  return $(form).serialize();
}

var USER_DATA;

// ======================== SAVE LOAD FUNCTIONS ==============================

// Loads the user data for the current CAS user.
function loadUserData() {
  $.get("/userdata", renderUserData)
}

// Receives the user data for the current CAS user.
function renderUserData(jsonResponse) {
  userdata = parseJSON(jsonResponse);
  USER_DATA = userdata;

  programs = userdata["programsInfo"];
  for (var i = 0; i < programs.length; i++) {
    tr_obj = createTableRow(programs[i], "program");
    tr_obj.click();
  }
}

// ========================= DB ADD/REMOVE FUNCTIONS ==================================
// XHR POST handling function for adding courses
// Requires the course name (COS 333), and semester in which it was taken.  (F18)
function addCourseToUser(course, semester) {
  var dict = {
    "form_name": "COURSE_ADD",
    "course": course,
    "semester": semester
  }
  $.post('/plan',
         serialize(dict),
         callbackAddCourseToUser
       );
}

// XHR POST handling function for removing courses
// Requires the course name (COS 333), and semester in which it was taken.  (F18)
function removeCourseFromUser(course, semester) {
  var dict = {
    "form_name": "COURSE_REMOVE",
    "course": course,
    "semester": semester
  }
  $.post('/plan',
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
    "course": course,
    "semester": semester,
    "program": program,
    "category": requirement // in the backend, "requirement" is referred to as "category".
  }
  $.post('/plan',
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
    "course": course,
    "semester": semester,
    "program": program,
    "category": requirement // in the backend, "requirement" is referred to as "category".
  }
  $.post('/plan',
         serialize(dict),
         callbackRemoveOverrideFromUser
       );
}

// XHR POST handling function for adding programs
// Requires the name of the program to add.
function addProgramToUser(program) {
  var dict = {
    "form_name": "PROGRAM_ADD",
    "program": program
  }
  $.post('/plan',
         serialize(dict),
         callbackAddProgramToUser
       );
}

// XHR POST handling function for removing programs
// Requires the name of the program to remove.
function removeProgramFromUser(program) {
  var dict = {
    "form_name": "PROGRAM_REMOVE",
    "program": program
  }
  $.post('/plan',
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

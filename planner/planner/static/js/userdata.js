var USER_DATA;

// ======================== SAVE LOAD FUNCTIONS ==============================

// Loads the user data for the current CAS user.
function loadUserData() {
  $.get("/userdata", updatePageData)
}

// Receives the user data for the current CAS user.
function updatePageData(jsonResponse) {
  userdata = parseJSON(jsonResponse);
  USER_DATA = userdata;

  programs = userdata["programsInfo"];
  for (var i = 0; i < programs.length; i++) {
    tr_obj = createTableRow(programs[i], "program");
    tr_obj.click();
  }
}

// Saves the user data for the current CAS user.

// HENRY'S SHIT
// XHR POST handling function for adding courses
function courseAddSubmit() {
  var courseAddForm = $("#courseAddForm");
  $.post('/plan',
         courseAddForm.serialize(),
         updateCourseAdd
       );
}

// Dummy function for courseAddSubmit (does nothing because callback is useless)
function updateCourseAdd() {
}

// XHR POST handling function for adding enrolled courses
function enrolledCourseAddSubmit() {
  var enrolledCourseAddForm = $("#enrolledCourseAddForm");
  $.post('/plan',
         enrolledCourseAddForm.serialize(),
         updateEnrolledCourseAdd
       );
}

// Dummy function for enrolledCourseAddSubmit (does nothing because callback is useless)
function updateEnrolledCourseAdd() {
}

// XHR POST handling function for adding programs
function programAddSubmit() {
  var programAddForm = $("#programAddForm");
  $.post('/plan',
         programAddForm.serialize(),
         updateProgramAdd
       );
}

// Dummy function for programAddSubmit (does nothing because callback is useless)
function updateProgramAdd() {
}

// XHR POST handling function for removing courses
function courseRemoveSubmit() {
  var courseRemoveForm = $("#courseRemoveForm");
  $.post('/plan',
         courseRemoveForm.serialize(),
         updateCourseRemove
       );
}

// Dummy function for courseRemoveSubmit (does nothing because callback is useless)
function updateCourseRemove() {
}

// XHR POST handling function for removing programs
function programRemoveSubmit() {
  var programRemoveForm = $("#programRemoveForm");
  $.post('/plan',
         programRemoveForm.serialize(),
         updateProgramRemove
       );
}

// Dummy function for programRemoveSubmit (does nothing because callback is useless)
function updateProgramRemove() {
}

// XHR POST handling function for removing enrolled courses
function enrolledCourseRemoveSubmit() {
  var enrolledCourseRemoveForm = $("#enrolledCourseRemoveForm");
  $.post('/plan',
         enrolledCourseRemoveForm.serialize(),
         updateEnrolledCourseRemove
       );
}

// Dummy function for enrolledCourseRemoveSubmit (does nothing because callback is useless)
function updateEnrolledCourseRemove() {
}

// ========================= UPDATE FUNCTIONS ================================

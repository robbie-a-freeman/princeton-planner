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


// ========================= UPDATE FUNCTIONS ================================

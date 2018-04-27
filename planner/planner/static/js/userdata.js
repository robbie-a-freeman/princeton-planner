

// ======================== SAVE LOAD FUNCTIONS ==============================

// Loads the user data for the current CAS user.
function loadUserData() {
  $.get("/userdata", updatePageData)
}

// Receives the user data for the current CAS user.
function updatePageData(jsonResponse) {
  userdata = JSON5.parse(jsonResponse);
}

// Saves the user data for the current CAS user.


// ========================= UPDATE FUNCTIONS ================================

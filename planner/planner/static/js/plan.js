// Initial function called to setup HTML elements, listeners, etc.
function plan_init() {
  var courseSearchBox = $("#courseSearch")[0];
  //courseSearchBox.addEventListener("keypress", courseSearchSubmit);
  courseSearchBox.addEventListener("keyup", keyEventHandler);

}

function keyEventHandler(event) {
  var key = event.key;

  if (isConsiderableKey(key)) {
    courseSearchSubmit();
  }
}

// Return true if we'd like to respond to this key being pressed; else false.
// TODO make space a considerable key!!
function isConsiderableKey(key) {
    return ((key >= '0' && key <= '9') |
            (key >= 'a' && key <= 'z') |
            (key == "Backspace"));
}

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

  // Preprocess the JSON response so it is suitable for parsing
  jsonResponse = jsonResponse.replace(/ObjectId\((['"].*?['"])\)/g, "$1");
  results = JSON5.parse(jsonResponse);

  // Create the results header
  var resultHeading = document.createElement("h3");
  var numResults = results.length;
  resultHeading.appendChild(text(numResults + " Search Results"));

  // Create the results elements
  var resultTableDiv = document.createElement("div");
  resultTableDiv.id = "course-table-scroll";
  var resultTable = document.createElement("table");
  var resultTableBody = document.createElement("tbody");

  // Add them to each other
  resultTableDiv.appendChild(resultTable);
  resultTable.appendChild(resultTableBody);


  // Generate a table row + entry for each search result.
  for (var i = 0; i < numResults; i++) {
    // Create elements for each row
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var label = text(createCourseTag(results[i]));

    // Add elements to each other
    td.appendChild(label);
    tr.appendChild(td);
    resultTableBody.appendChild(tr);
  }

  // Clear old results, and insert new ones.
  results = $("#courseSearchResults");
  results.empty();
  results[0].appendChild(resultTableDiv);

  resultsHeaderDiv = $("#courseSearchHeader");
  resultsHeaderDiv.empty();
  resultsHeaderDiv[0].appendChild(resultHeading);
}





// =========================== HELPER FUNCTIONS =========================
/*
 * Return a string of the form COS333 for the given json entry
 */
function createCourseTag(courseJSON) {
    var listings = courseJSON['listings']
    var listingArr = [];
    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      listingArr.push(listing['dept'] + listing['number']);
    }
    // return listingArr[0];
    return listingArr.join(" / ");
}

/*
 * Creates a DOM child text node containing the given str
 */
function text(str) {
  return document.createTextNode(str);
}

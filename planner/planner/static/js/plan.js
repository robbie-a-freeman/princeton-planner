// Initial function called to setup HTML elements, listeners, etc.
function plan_init() {
  var courseSearchBox = $("#courseSearch")[0];
  courseSearchBox.addEventListener("keypress", courseSearchSubmit);

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
         updateCourseResults(data)
       );
}


/* Function to take in a jsonResponse from an XHR request and to
 * process that json into an HTML <ul> element, then display
 * the final result on the DOM.
 */
function updateCourseResults(jsonResponse) {
  var resultUL = document.createElement("ul");

  // Generate a list entry for each search result.
  for (var i = 0; i < jsonResponse.length; i++) {
    var li = document.createElement("li");
    var label = text(createCourseTag(jsonResponse[i]));


    li.appendChild(label);
    resultUL.appendChild(li);
  }

  // Clear old results, and insert new ones.
  results = $("#courseSearchResults");
  results.empty();
  results[0].appendChild(resultUL);
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
    return listingArr[0];
    return listingArr.join("/");
}

/*
 * Creates a DOM child text node containing the given str
 */
function text(str) {
  return document.createTextNode(str);
}

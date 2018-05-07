/* for ua.princeton.edu */
javascript:( function() {
	var tags = [];
	var courses = document.getElementsByClassName("course-title");
	for (var i = 0; i < courses.length; i++) {
		var parts = courses[i].innerText.split(" ");
		tags.push(parts[0] + " " + parts[1]);
	}
	console.log("\"" + tags.join("\",\n\"") + "\"");
}
)();


/* for AAS specifically */
var className = "ma-course-listing-course-number";
var courses = document.getElementsByClassName(className);
var arr = [];
for (var i = 0 ; i < courses.length; i++) {
	arr.push(courses[i]
			.innerText
			.split(",")[0]
			.trim());
}
console.log("\"" + arr.join("\",\n\"") + "\"");


/* bookmarklet */
javascript:(function() { console.log("hi"); })();

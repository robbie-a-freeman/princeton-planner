<h1>Developer Guide</h1>

<h2>Backend Design (Python, PyMongo, MongoDB)</h2>

<h3>Database</h3>

Our MongoDB database is hosted with mLab, and the access credentials are provided in index.html. It consists of a single database, plannerdb, which contains many collections, including one collection for each semester, containing information about all courses that were offered in that semester. We additionally maintain collections listing information about all majors, certificates, and degrees currently offered, including what requirements are necessary to satisfy each. Finally, we maintain a collection of users to save the programs and courses each user has selected, which allows us to provide a persistent experience across multiple planning sessions.

<h3>Scraping course data (utils/scraper.py, data/courses*.json)</h3>

Our scraping program scraper.py is largely based off of the scraper written by Alex Ogier '13 and maintained by Professor Kernighan provided from COS333’s Assignment 4. The original scraper functions by using BeautifulSoup, an HTML scraping library designed for Python. It scrapes the registrar’s website for courses in a given semester, and returns a JSON object storing information like the department, course name, and distribution area. We stored the output of this scraping in the data/coursesAXX.json files, where the first letter is either F or S, to signify fall or spring, and the last two digits represent the last two digits of the year (e.g. 18 for 2018). The program is runnable from within the VagrantBox provided in /vagrant, which is pre-configured with all appropriate dependencies. The program usually takes 75 minutes to run.

We have made small modifications from the original scraper to add some additional quality-of-life features, accessible through command-line arguments. The first command line argument that can be provided is a 4-digit semester code. Possible values are documented in the source file. This must be the first argument, if provided. Other flags include -v for verbose mode, which prints debugging information each time a course is scraped, -u for unique mode, which attempts to filter out any duplicate course listings, and -s to log a message any time these duplicates occur. Future courses are predicted using data from the semester two years prior, to account for those courses which are offered only every other year.

<h3>Program Data (data/majors.json, data/certificates.json)</h3>

Our program data is based off of the data used by CourseGenie, a past COS 333 group. We have curated the original data provided in their data/all.yaml file by standardizing naming conventions and updating inaccuracies wherever we found them. Additionally, we split the file into three distinct, more manageable JSON files representing degrees, majors, and certificates. These files can be imported into the MongoDB instance using the mongoimport utility, with the --json-array and --drop flags specified.

<h3>Searching for courses and programs (planner/planner/*_search.py)</h3>

The logic for our course and program searching takes place entirely server-side. The search logic for programs is relatively straightforward; given a user’s search term, we create a regular expression for that term, and use PyMongo queries to match it against either a) the full name of the major including an optional track within that major, or b) the shortened form of that major. For example, “Computer Sc” and “cos” should both yield a result for the COS major. 

For course searching, we allow for more complex queries. We first split (by whitespace) each query and categorize each query. For example, after splitting, our initial query of “COS 126 EGR cOs qR Interdisciplinary” becomes six sub-queries: [‘COS’, ‘EGR’, ‘cOs’, ‘126’, ‘qR’, ‘Interdisciplinary’]. We then categorize ‘COS’, ‘EGR’, and ‘cOs’ as department names, ‘126’ as a course number, ‘qR’ as a distribution requirement, and ‘Interdisciplinary’ as part of a course title. For each sub-query of the same category, we take the union of all matching courses. Since ‘COS’ and ‘cOs’ both match ‘COS’, the three sub-queries of ‘COS’, ‘EGR’, and ‘cOs’ return the union of all courses in both the COS and EGR departments. We do this for each category of sub-query. Finally, we take the intersection of all categories of sub-query. Hence, we return the intersection of courses in the COS or EGR department, courses with number 126, courses fulfilling the QR requirement, and courses with ‘Interdisciplinary’ in their title. Hence, the final course list is simply ‘COS 126’. We also provide a rich list of different sub-query types including special cases such as ‘COS333’.

<h3>Storing User Data  (planner/planner/user_info.py)</h3>

Each user’s database entry consists of three types of information: courses, programs, and overrides. Courses consists of an array of key-value pairs, which contains the name of the semester, and a list of enrolled courses for that semester. Programs consists simply of a list of the programs that the user has selected. Overrides is not fully implemented, but allows for users to manually specify that they wish for a certain course to satisfy a given requirement in a given semester, even if a) that course does not exist in that semester, or b) that course would not normally satisfy that requirement.  


<h2>Frontend Design (HTML, CSS, Javascript, Bootstrap)</h2>

<h3>Homepage (planner/planner/templates/index.html)</h3>

The homepage was taken from a Bootstrap template found here and was edited to support our specific needs. We created simple, easily comprehensible text and included headers that would link to the desired part of the website. We also created a feedback form using Flask-WTF and connected this form to our email, theprincetonplanner@gmail.com such that we could receive emails regarding feedback messages immediately.

<h3>Planning page (planner/planner/templates/plan.html, planner/planner/static/js/plan.js, planner/planner/static/css/land.css)</h3>

Our main page was stored in a file plan.html, and we adapted our design from the blank webpage template as shown here. Our aim was to have our main planning page to be as clutter-free and intuitive as possible. 

The main structure we used for the center panel was the Bootstrap Accordion, which we automatically generated in the file plan.js, using adapted styling in the file land.css so that the Accordions could be aligned next to each other in a scrollable center screen. As the Accordion is being generated, in the dropdowns for each Accordion, we used the Bootstrap Popover that would be populated by the courses that would satisfy that specific requirement. We also implemented an up-down counter for each requirement that would maintain the fraction of courses that have been fulfilled using plan.js.

For the left-hand side panel, we used the Bootstrap Radio form selection feature, stylized using land.css, and would switch to the corresponding semester choice using plan.js. 

For both the right-hand and left-hand side panels, we used a simple Bootstrap search element for course and major/certificate searching. For course and major/certificate search results, we used a scrollable table element with fixed height in order to handle a large number of results. In order to display which courses have been selected for each semester, we had a list of div elements, each storing a table of that semester’s courses, that would be correspondingly hidden or displayed depending on which semester it was.

<h2>Connecting the backend and frontend</h2>

<h3>jQuery AJAX Requests (planner/planner/routes.py, planner/planner/static/js/plan.js, planner/planner/static/js/userdata.js)</h3>

We used the jQuery AJAX library to send POST and GET requests from within JavaScript. These requests originate in plan.js (if searching for courses or programs) or in userdata.js (if updating a user’s database information), and they send any required information from the client to the server, packaged as a serialized sequence of key-value pairs. This information is unpacked by Flask’s requests API, which then delegates to the correct server-side python program, depending on which action was requested.  

<h3>Routing (planner/planner/routes.py)</h3>

All of the routing for our website takes place within routes.py. This Flask file consists of a list of routing endpoints, followed by the action to take when an HTTP request reaches that endpoint. The primary routes of interest are /, the root directory, which renders the main homepage, /plan, which renders the planning page and handles search queries, and /userdata, which handles retrieval of user data from the database. Several additional routes are provided, either for error handling (e.g. a 404 page), or for the instructors’ access (such as /guest1 or /guest_plan). 

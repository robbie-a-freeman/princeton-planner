# princeton-planner

Recommendations
====================
- From Alvin:
- Do this for major declarations instead of major completion. (Maybe for further exploration?)
- (From Henry), so maybe like an algorithm that a user asks for that gives majors that could work given the courses currently taken?
- (Also from Henry), so I was thinking that in the future (if anybody ever wants to work on this again), an algorithm to implement the best permutation of courses across requirements.
- From Alvin:
- Maybe have majors first, since that's what we're offering the most functionality for. (Henry - Should we implement this???)
- Hence, have majors first, and then have searching courses on the right side.
- From Jeremie:
- Have a pretty-fire function, which knows the exact format/interface of front-end and packages it all up in one function.
- Maybe show semesters with courses in the main interface. Maybe have a checkbox which toggles semesters.
- LAST DAY OF CLASSES MEETING:
- Upper bound on the requests for course searching - say a billion, make api calls in terms of 100
- When selecting enrolled course, have a visual cue, say accordion automatically unrolls or a flash
- Is selecting semesters a UI issue? - maybe have tabs...?
- Two clicks...maybe have links all at the top so just one click? - One tab for F, one tab for S - Crossing out/filling in current one
- Maybe have a separate field for user override?
- Import transcript API

Current Priorities
===================
- GET MORE MAJOR/CERTIFICATE REQUIREMENTS!
- Load/render user data upon loading plan (just overrides now... :/)
- Hammer out more landing page stuff - like help and about section
- Have a total requirements satisfied for majors at top or bottom of accordion
- Get overrides figured out...
- Get email on home page down
- Input data/all.yaml from CourseGenie into the MongoDB server (possibly by first parsing into json)
- Finalize frontend design and begin to implement
- Add README.md files to each directory as a form of documentation.
- Hammer down intricacies of design - details of implementation (INTERFACE INTERCONNECTION)
- Hardest part will be determining how courses fit into majors and coding that up
- Backend of determining courses and which belong to which...
- Start thinking about predictive algorithm for picking courses in future semesters
- Testing! - Start writing tests

In Progress
====================
- Input the results of utils/scraper.py into the MongoDB server (!!!)
- Continue to figure out POST
- Testing! - Start writing tests

- Wait... shoot... MUS 213 counts twice for music performance certificate, how do we account for that? I have an idea (ACTUALLY, JUST MAKE USERS FIGURE THAT OUT)

For Front End (Meeting with Jeremie)
- hourclock for semesters that are upcoming
- distinguish between already taken courses and anticipated courses
- (1/2) to show how many requirements are fulfilled
- More succinct captions
- tooltips
- simulate workflow of user
- Limit caption size for requirements
- When you click course, you go to that semester's editing page

Completed
====================
- Configure Vagrant so it can run utils/scraper.py and a MongoDB server
- Load MongoDB with courses.json data.
- Set up Heroku Server.
- Get Flask and bootstrap to work on Heroku YAY
- Get CAS authentication down! YAY!
- Config variables for the win <-- able to connect to MongoDB server now
- We know what a framework is! yay lol (Django and Flask) <-- HAHA DJANGO SUCKS
- Got basic frontend design down!
- Make course info box actually just a link to princetoncourses.com
- Keep track of user data
- Set up a minimalistic server program that takes in user search strings, sanitizes them, and converts them into well-formed MongoDB queries.
- Logout button
- Turning search queries into mongodb queries
- Improve search functionality
- Fix Landing Page bugs
- Include term that you have taken a course

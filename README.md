# princeton-planner

Recommendations
====================
- From Alvin:
- Maybe have majors first, since that's what we're offering the most functionality for.
- Hence, have majors first, and then have searching courses on the right side.

Current Priorities
===================
- Input data/all.yaml from CourseGenie into the MongoDB server (possibly by first parsing into json)
- Finalize frontend design and begin to implement
- Set up a minimalistic frontend UI that takes in user search strings and sends them to server.
- Add README.md files to each directory as a form of documentation.
- Get requirements database! (Recursive stuff)
- Hammer down intricacies of design - details of implementation (INTERFACE INTERCONNECTION)
- Logout button
- Sometimes the heroku site doesn't load correctly.. it incorrectly redirects to /plan.html/ instead
- Hardest part will be determining how courses fit into majors and coding that up
- Backend of determining courses and which belong to which...
- Improve search functionality
- Keep track of user data (From Henry - I think this is where our local database might play a role), also we need to store users who have visited before with their netids and their corresponding information like all enrolled courses
- Fix Landing Page bugs
- Start thinking about predictive algorithm for picking courses in future semesters
- Testing! - Start writing tests

In Progress
====================
- Input the results of utils/scraper.py into the MongoDB server
- How to connect backend with frontend
- Set up a minimalistic server program that takes in user search strings, sanitizes them, and converts them into well-formed MongoDB queries.
- Turning search queries into mongodb queries (Will already on this)
- Continue to figure out POST
- Keep track of user data (From Henry - I think this is where models.py might play a role - MongoDB database)
- Testing! - Start writing tests

- Wait... shoot... MUS 213 counts twice for music performance certificate, how do we account for that? I have an idea

For Front End (Meeting with Jeremie)
- hourclock for semesters that are upcoming
- distinguish between already taken courses and anticipated courses
- (1/2) to show how many requirements are fulfilled
- More succinct captions
- tooltips
- simulate workflow of user
- Limit caption size for requirements
- Include term that you have taken a course
- When you click course, you go to that semester's editing page

Completed
====================
- Configure Vagrant so it can run utils/scraper.py and a MongoDB server
- Load MongoDB with courses.json data.
- Set up Heroku Server.
- Get Django and bootstrap to work -> put on Heroku! <-- HAHA FUCK DJANGO
- Get Flask and bootstrap to work on Heroku YAY
- Get CAS authentication down! YAY!
- Config variables for the win <-- able to connect to MongoDB server now
- We know what a framework is! yay lol (Django and Flask) <-- HAHA DJANGO SUCKS
- Got basic frontend design down!

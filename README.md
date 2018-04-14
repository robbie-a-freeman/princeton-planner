# princeton-planner

Current Priorities
===================
- Input data/all.yaml from CourseGenie into the MongoDB server (possibly by first parsing into json)
- Finalize frontend design and begin to implement
- Set up a minimalistic frontend UI that takes in user search strings and sends them to server.
- Add README.md files to each directory as a form of documentation. 
- Get requirements database! (Recursive stuff)
- Hammer down intricacies of design - details of implementation (INTERFACE INTERCONNECTION)
- CAS Authentication
- Logout button

In Progress
====================
- Input the results of utils/scraper.py into the MongoDB server
- How to connect backend with frontend
- Set up a minimalistic server program that takes in user search strings, sanitizes them, and converts them into well-formed MongoDB queries.
- Get MongoDB database on Django/Heroku
- Index page has some bugs (frontend stuff)
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
- Get Django and bootstrap to work -> put on Heroku!
- We know what a framework is! yay lol (Django and Flask)
- Got basic frontend design down!

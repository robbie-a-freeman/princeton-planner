# princeton-planner

Current Priorities
===================
- Input data/all.yaml from CourseGenie into the MongoDB server (possibly by first parsing into json)
- Finalize frontend design and begin to implement
- Finalize frameworks (what is a framework???)
- Set up a minimalistic frontend UI that takes in user search strings and sends them to server.
- Add README.md files to each directory as a form of documentation.

In Progress
====================
- Input the results of utils/scraper.py into the MongoDB server
- Finalize Frameworks (what is a framework???)
- Set up a minimalistic server program that takes in user search strings, sanitizes them, and converts them into well-formed MongoDB queries.

Completed
====================
- Configure Vagrant so it can run utils/scraper.py and a MongoDB server
- Load MongoDB with courses.json data.
- Set up Heroku Server.


Demo-ing POST
====================
To demonstrate:

vagrant reload
vagrant ssh
cd /vagrant
chmod 700 server.sh #if necessary
./server.sh

Then on local machine:
Open localhost:8040/plan.html in chrome. Type in a course query and hit the search button

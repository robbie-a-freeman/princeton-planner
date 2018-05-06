# ----------------------------------------------------------------------------
# user_info.py
# ----------------------------------------------------------------------------

# This program takes in an *unsanitized* query string from the user,
# sanitizes it to reduce the risk of injection-style attacks, and
# then generates a MongoDB query that will search the database to satisfy
# the user's queryself.

# This program is not responsible for: processing the POST server query,
# Sending the MongoDB query to MongoDB, or receiving the results of the mongodb
# query, or repackaging the results for use in the frontend HTMLself.

# Takes in a netid as an argument (this is fixed, passed in as a return value
# from CAS authentication)

# ============================================================================
# We define a user as follows:
#
# USER:
#     COURSE:
#         PROGRAMS:
#
#
# Note: We assume that the "accordions" for each track/program only have at
#       most one level.
#
# Note1: If we map courses to programs, then removing programs can be hard.
#        Do we have to linear scan essentially???
#
# Note2: If we map programs to courses, there are more values to store for sure.
#
# THE ABOVE IS DEPRECATED.
# THE ABOVE IS WRONG.
#
# We define a user in a different potentially more natural way.

import re, os
from pymongo import MongoClient
from pymongo import collection


#client = MongoClient('localhost', 27017)
#db = client.test      # Remember to change in vagrant_up if this changes
#courses = db.courses


# Fetch the URI from environment variable to avoid leaking credentials.
mongoURI = os.environ.get('MONGOLAB_URI')
client = MongoClient(mongoURI)
db = client.plannerdb
users = db.users
majors = db.majors
certificates = db.certificates
AFTER = collection.ReturnDocument.AFTER

# the semesters provided
semesterCodes = ["F14", "S15", "F15", "S16", "F16", "S17", "F17", "S18", "F18", "S19" , "F19", "S20", "F20", "S21"]

# Sanitize the input string.
# MUST IMPLEMENT THIS!!!
# Actually, I don't think we need to sanitize this...
def sanitize(unsafe):
    # This doesn't do much sanitizing right now!
    return unsafe

# Given a user, add user if new and return information if existing user
def user_query(user):
    #users.findAndModify({"query": {"user": user }, "new": True, "upsert": True})
    userInfo = users.find_one({'netid': user})
    # if the user doesn't exist in the database yet
    if userInfo is None:
        semesters = []
        for semester in semesterCodes:
            semesters.append({"semester": semester, "courses": []})
        userInfo = users.find_one_and_update(
            {'netid': user},
            {'$set': {"programs": [], "semesters": semesters, "overrides": []}},
            upsert=True,
            return_document=AFTER
        )
    #userInfo = users.find_one_and_update({'netid': 'test'}, {"$set": {"exists":"True"}}, upsert=True, return_document=AFTER)

    # Gather information about the user's enrolled programs from the database.
    programsInfo = []
    for program in userInfo['programs']:
        fullName = program
        nameParts = fullName.split(" - ")

        # extract major + track from combined string.
        major = nameParts[0]
        majorRE = {"$regex":major, "$options":"i"}
        if len(nameParts) == 1: # no track
            programInfo =  [maj for maj in majors.find({"name": majorRE})]
            programInfo += [cert for cert in certificates.find({"name": majorRE})]
            print(fullName)
            programsInfo.append(programInfo[0])
            continue

        elif len(nameParts) == 2: # simple track
            track = nameParts[1]
        elif len(nameParts) == 3: # two-part track
            track = nameParts[1] + " - " + nameParts[2]

        trackRE = {"$regex":track, "$options":"i"}

        programInfo = [maj for maj in majors.find( {"$and": [ {"name": majorRE}, {"track": trackRE} ]} ) ]
        programInfo += [cert for cert in certificates.find( {"$and": [ {"name": majorRE}, {"track": trackRE} ]} ) ]
        programsInfo.append(programInfo[0])

    # Gather information about the user's enrolled courses from the database.
    coursesInfo = []
    for semester in userInfo["semesters"]:
        semesterInfo = {}
        semID = semester["semester"]
        semesterInfo["semester"] = semID
        semCourses = []
        for course in semester["courses"]:
            listings = course.split(" / ")
            # Might be risky, but we will just compare a single dept/number combo instead of all cross listings
            firstDept = listings[0].split(" ")[0]
            firstNumber = listings[0].split(" ")[1]
            courseResults = [course for course in db["courses"+semID].find( {"listings": {"$elemMatch": {"dept": firstDept, "number": firstNumber} } } ) ]
            # print(courseResults[0])
            if (len(courseResults) > 0):
                semCourses.append(courseResults[0])
            else:
                print("No courses found in DB %s for %s" % (semID, listings[0]))
        semesterInfo["courses"] = semCourses
        coursesInfo.append(semesterInfo)

    results = {"programsInfo": programsInfo,    \
               "userInfo":     userInfo,        \
               "coursesInfo":  coursesInfo}
    return results


# Given a user and a program and the associated categories, add the program and list of categories to existing programs
#def add_program(user, program, categories):
    #if not users.find_one({"$and": [{"netid": "test"}, {"programs": {"$elemMatch": {"MUS"}}}]}):
    #    # categories is a list. We need to feed in a list to find_one_and_update()
    #    listCat = []
    #    for cat in categories:
    #        listCat.append({"category": cat, "courses": []})
    #    users.find_one_and_update(
    #        {"netid": "test"},
    #        {"$addToSet": {"programs" : {"program": "MUS", "categories": listCat}}},
    #        upsert=False,
    #        return_document=AFTER
    #    )
def add_program(user, program):
    if not users.find_one({"$and": [{"netid": user}, {"programs": program}]}):
        users.find_one_and_update(
            {"netid": user},
            {"$addToSet": {"programs": program}},
            upsert=False,
            return_document=AFTER
        )

# Given a user and an enrolled course in a given semester, add enrolled course to existing user
def add_course(user, semester, course):
    if users.find_one({"$and": [{"netid": user}, {"semesters": {"$elemMatch": {"semester": semester, "courses": course}}}]}) is None:
        users.find_one_and_update(
            {"$and": [{"netid": user}, {"semesters": {"$elemMatch": {"semester": semester}}}]},
            #{"$addToSet": {"semesters.$.semester" : {"program": "MUS", "categories": []}}},
            {"$addToSet": {"semesters.$.courses": course}},
            upsert=False,
            return_document=AFTER
        )
    # Should the front-end handle if a user wants to put the same course down twice for a semester???

# Given a user and a semester, add semester to existing user
def add_semester(user, semester):
    if not users.find_one({"$and": [{"netid": user}, {"semesters": {"$elemMatch": {"semester": "fall18"}}}]}):
        users.find_one_and_update(
            {"netid": user},
            {"$addToSet": {"semesters": {"semester": "fall18", "courses": []}}},
            upsert=False,
            return_document=AFTER
        )

# Given a user, a program, a category, course, and semester, add the course to the override
def add_override(user, program, category, course, semester):
    if not users.find_one({"$and": [{"netid": user}, {"overrides": {"$elemMatch": {"program": program, "category": category, "course": course, "semester": semester}}}]}):
        users.find_one_and_update(
            {"netid": user},
            {"$addToSet": {"overrides": {"program": program, "category": category, "course": course, "semester": semester}}},
            upsert=False,
            return_document=AFTER
        )

# Given a user and a program, remove the program
def remove_program(user, program):
    #if users.find_one({"$and": [{"netid": "test"}, {"programs": {"$elemMatch": {"program": "Electrical Engineering"}}}]}):
    users.find_one_and_update(
        {"netid": user},
        {"$pull": {"programs": program}}
    )

# Given a user, the current semester, and an enrolled course, remove the enrolled course
# Must remove from all programs
def remove_course(user, semester, course):
    users.find_one_and_update(
        {"$and": [{"netid": user}, {"semesters": {"$elemMatch": {"semester": semester}}}]},
        {"$pull": {"semesters.$.courses": course}}
    )

# Given a user, a program, a category, course, and semester, remove the override
def remove_override(user, program, category, course, semester):
    users.find_one_and_update(
        {"netid": user},
        {"$pull": {"overrides": {"program": "Computer Science", "category": "Departmentals", "course": "COS 445", "semester": "S18"}}}
    )

# main()

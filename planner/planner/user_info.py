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

# Sanitize the input string.
# MUST IMPLEMENT THIS!!!
# Actually, I don't think we need to sanitize this...
def sanitize(unsafe):
    # This doesn't do much sanitizing right now!
    return unsafe

# Given a user, add user if new and return information if existing user
def user_query(user):
    #users.findAndModify({"query": {"user": user }, "new": True, "upsert": True})
    userInfo = users.find_one_and_update({'netid': 'test'}, {"$set": {"exists":"True"}}, \
                                     upsert=True, return_document=AFTER)

    programsInfo = []
    for program in userInfo['programs']:
        fullName = program["program"]
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

    results = {"programsInfo": programsInfo, "userInfo": userInfo}
    return results

# Given a user, the current program, a given category, and a course, add the course to existing user's program
def add_course(user, program, category, course):
    users.find_one_and_update({"$and": [{"netid": "test"}, {"programs.$.program": "Mechanical and Aerospace Engineering - Aerospace Engineering"}, {"programs.$.categories.$.category": "Prerequisites"}]},
        {"$addToSet": {"programs.categories.courses": "MUS 213"}},
        upsert=False,
        return_document=AFTER
    )
    #users.find_one_and_update({'netid': 'test'}, {"$set": {"exists":"true"}}, upsert=True, return_document=AFTER)

# Given a user and a program, add the program to existing programs
def add_program(user, program):
    users.find_one_and_update({"netid": "test"},
        {"$addToSet": {"programs" : {"program": "MUS", "categories": []}}},
        upsert=False,
        return_document=AFTER
    )
    #users.find_one_and_update("netid": 'test', {"programs": {"$elemMatch": {"program":program, "courses":[]}}}, {"$set": {"exists":"true"}}, upsert=True, return_document=AFTER)

# Given a user and an enrolled course in a given semester, add enrolled course to existing user
def add_enrolled_course(user, semester, course):
    users.find_one_and_update({"$and": [{"netid": "test"}, {"semesters.$.semester": "fall18"}]},
        {"$addToSet": {"semesters.$.semester" : {"program": "MUS", "categories": []}}},
        upsert=False,
        return_document=AFTER
    )
    #users.find_one_and_update()

# Given a user and a semester, add semester to existing user
def add_semester(user, semester):
    users.find_one_and_update({"netid": "test"},
        {"$addToSet": {"semesters": {"semester": "fall17", "courses": []}}},
        upsert=False,
        return_document=AFTER
    )

# Given a user and a course, remove the course from the program (and possibly the category) ??? should we remove the category?
def remove_course(user, program, category, course):
    pass

# Given a user and a program, remove the program
def remove_program(user, program):
    pass

# Given a user and an enrolled course, remove the enrolled course
# Must remove from all programs
def remove_enrolled_course(user, course):
    pass

# Given a single sub-part of the query string, generate the
# corresponding Mongo query, and return the results of the
# Mongo query, as an array of json objects (strings or objects?)
def queryOneWord(word):
    word = word.upper()
    results = []

    re_obj = {"$regex":word, "$options":"i"}

    if len(word) <= 1:
        return results

    # Dept. ID:
    elif word in dept_ids:
        results = [course for course in courses.find( {"listings.dept":word} ) ]

    # Course number:
    elif re.match("\d\d\d", word):
        results = [course for course in courses.find( {"listings.number":word} ) ]

    # Dist. ID:
    elif word in dist_ids:
        results = [course for course in courses.find( {"area": word}) ]

    # Len <= 2:
    elif len(word) <= 2:
        # TODO fix bug where courses satisfying mutliple conditions are duplicated (use a set)
        results  = [course for course in courses.find( {"listings.dept":   re_obj} )]
        results += [course for course in courses.find( {"listings.number": re_obj} )]
        results += [course for course in courses.find( {"title":           re_obj} )]

    # Len >= 3:
    else:
        results = [course for course in courses.find( {"title":           re_obj} )]

    return results

# Split the sanitized query string into sub-parts and
# generate a mongo query for eachself.
def queryAllWords(safe):
    words = safe.split()
    results = []
    for word in words:
        results.append(queryOneWord(word))
    return results


# public variant of queryAllWords called by landing.py
def course_db_query(safe):
    print(safe)
    return queryOneWord(safe)
    ### Debug version
    # return "query to query_parser was: " + safe
    ### Old version
    #results = queryOneWord(safe) # queryAllWords bugged for some reason. TODO
    #out_results = [result for result in results]
    #return out_results
    ### Very old version (it's very old for a reason)
    #output_strings = [getCourseTag(result) for result in results]
    #return "Query: %s <br>\n" % safe + "<br>\n".join(output_strings)


### Helper functions

# Return the 6-digit course tag (COS333) for a json result
# If a course is cross listed, return all applicable course tags, separated by '/'
def getCourseTag(result):
    listings = result['listings']
    listingTags = [listing['dept'] + listing['number'] for listing in listings]
    return '/'.join(listingTags)

### Unit Testing
# Run a single query for the given testWord and print result tags
def queryOneTest(testWord):
    print("Querying MongoDB for \"%s\"..." % testWord)
    results = queryOneWord(testWord)
    for result in results:
        print(getCourseTag(result))
    print("\n")

# Run several queries and print results.
def main():
    queryOneTest("COS")
    queryOneTest("333")
    queryOneTest("600")
    queryOneTest("ABC")
    queryOneTest("MUS")
    queryOneTest("DAN")
    queryOneTest("IMPLICATIONS")


# main()
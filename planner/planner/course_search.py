# This program takes in an *unsanitized* query string from the user,
# sanitizes it to reduce the risk of injection-style attacks, and
# then generates a MongoDB query that will search the database to satisfy
# the user's queryself.

# This program is not responsible for: processing the POST server query,
# Sending the MongoDB query to MongoDB, or receiving the results of the mongodb
# query, or repackaging the results for use in the frontend HTMLself.

# TO DO:
#   Reconsider design. Could greatly simplify using the MongoPy library!
#   Add in support for querying ANY semester's courses, not just the most recent one.
#   Add in support for upper/lower case-insensitivity
#   Modify getCourseTag() to account for cross listings ('COS333/MUS211/EGR209')
#   Add error checking -- What if Mongo refuses to connect? It likes to do this a lot for some reason.
#   Reconsider return format of the query functions:
#           Perhaps it would be better for the frontend if we returned something like:
#        {"tag": "COS126/PHI201", "name": "Computer Science: An Interdisciplinary Approach"}
#   Revise so that it is possible to return searches from multiple categories
#       i.e. "COS" would match EITHER the dept id or the course name, returning both results lists
#
#   We consider a type of search which is a slightly more complex form of the intersection
#   of queries that we implemented in reg.py. We will consider the query string types
#   and take the intersection of the courses in each query string type.
#   For example, if the query string is "COS 333 ENG", then we could have two types:
#   DEPT: set(["COS", "ENG"])
#   NUMBER: set([333])
#   We take the intersection of the types of courses to obtain the final result list.
#
#   However, we need to consider names/titles of courses. If there is any query longer than 4 letters...
#
#
#   For example, if "COS" is contained within the title of a course, then check department. IF "COS"
#   is a department, then dont' check titles.
#   However, if we have a query like "SYS", then we check if the "SYS" department exists. If it doesn't,
#   then check the titles.
#   The same will happen for distribution requirements like "EC".
#   The same will also happen for course numbers like "333".
#   
#   Here are a few examples:
#                       Query - "COS 333"
#                       Dept - [COS]
#                       Number - [333]
#                       Union(Dept) intersects Union(Number)
#
#                       Query - "COS 126 226 217"
#                       Dept - [COS]
#                       Number - [126, 226, 217]
#                       Union(Dept) intersects Union(Number)
#
#                       Query - "COS ENG economics EC eC Ec micro 333"
#                       Dept - [COS, ENG]
#                       Number - [333]
#                       Distribution Requirements - [EC, eC, Ec]
#                       Title - [economics, micro]
#                       Union(Dept) intersects
#                       Union(Number) intersects
#                       Union(Distribution Requirements) intersects
#                       Union(Title)
#


# ======================================================================
#   Query String Types: (all case-insensitive)
#
#   Any three letters XYZ that are a valid dept. id (e.g COS)
#       Match against "listings" : [ {"dept": XYZ} ]
#
#   Any three numbers 000:
#       Match against "listings" : [ {"dept": 000}]
#
#   Any two letters XY that are a valid distr. req. (e.g. QR, EM)
#       Match against "area" : XY
#
#   Any other string X(Y) (len <= 2) NOT a distr. or dept. id:
#       Match against "title" : X(Y) OR
#       match against dept id: "listings" : [ {"dept": XY} ]
#       or match against number
#
#   Any other string (not dept id, not distr, len >= 3)
#       match against  Match against "title" : str
#
# =====================================================================

import re, os
from pymongo import MongoClient

#import json
from bson.json_util import dumps, loads # to handl BSON types


#client = MongoClient('localhost', 27017)
#db = client.test      # Remember to change in vagrant_up if this changes
#courses = db.courses


# Fetch the URI from environment variable to avoid leaking credentials.
mongoURI = os.environ.get('MONGOLAB_URI')
client = MongoClient(mongoURI)
db = client.plannerdb
courses = db.courses

# TYPES OF QUERIES
ZERO = 0
DEPT = 1
NUM = 2
DIST = 3
TIT1 = 4
TIT2 = 5

dept_ids = set(("AAS", "AFS", "AMS", "ANT", "AOS", "APC", "ARA",
                "ARC", "ART", "ASA", "AST", "ATL", "BCS", "CBE",
                "CEE", "CGS", "CHI", "CHM", "CHV", "CLA", "CLG",
                "COM", "COS", "CTL", "CWR", "CZE", "DAN", "EAS",
                "ECO", "ECS", "EEB", "EGR", "ELE", "ENE", "ENG",
                "ENT", "ENV", "EPS", "FIN", "FRE", "FRS", "GEO",
                "GER", "GHP", "GLS", "GSS", "HEB", "HIN", "HIS",
                "HLS", "HOS", "HPD", "HUM", "ISC", "ITA", "JDS",
                "JPN", "JRN", "KOR", "LAO", "LAS", "LAT", "LCA",
                "LIN", "MAE", "MAT", "MED", "MOD", "MOG", "MOL",
                "MSE", "MTD", "MUS", "NES", "NEU", "ORF", "PAW",
                "PER", "PHI", "PHY", "PLS", "POL", "POP", "POR",
                "PSY", "QCB", "REL", "RES", "RUS", "SAN", "SAS",
                "SLA", "SML", "SOC", "SPA", "STC", "SWA", "THR",
                "TPP", "TRA", "TUR", "TWI", "URB", "URD", "VIS",
                "WRI", "WWS"))

dist_ids = set(("EC", "EM", "HA", "LA", "QR", "SA", "STL", "STN"))

# Sanitize the input string.
# MUST IMPLEMENT THIS!!!
def sanitize(unsafe):

    # This doesn't do much sanitizing right now!
    return unsafe

# Given a single sub-part of the query string, generate the
# corresponding Mongo query, and return the results of the
# Mongo query, as an array of json objects (strings or objects?)
def queryOneWord(word):
    uWord = word.upper() # This is not actually entirely accurate for all regular expressions.
    results = set()

    re_obj = {"$regex":word, "$options":"i"}

    if len(word) <= 1:
        return (results, ZERO)

    # Dept. ID:
    elif uWord in dept_ids:
        results = (set([dumps(course) for course in courses.find( {"listings.dept":uWord} ) ]), DEPT)

    # Course number:
    elif re.match("\d\d\d", word):
        results = (set([dumps(course) for course in courses.find( {"listings.number":uWord} ) ]), NUM)

    # Dist. ID:
    elif uWord in dist_ids:
        results = (set([dumps(course) for course in courses.find( {"area": uWord}) ]), DIST)

    # Len <= 2:
    elif len(word) <= 2:
        # TODO fix bug where courses satisfying mutliple conditions are duplicated (use a set)
        results = set([dumps(course) for course in courses.find( {"listings.dept":   re_obj} )])
        results = results.union([dumps(course) for course in courses.find( {"listings.number": re_obj} )])
        results = (results.union([dumps(course) for course in courses.find( {"title":           re_obj} )]), TIT1)
        #results += [json.dumps(course) for course in courses.find( {"listings.number": re_obj} )]
        #results += [json.dumps(course) for course in courses.find( {"title":           re_obj} )]

    # Len >= 3:
    else:
        results = (set([dumps(course) for course in courses.find( {"title":           re_obj} )]), TIT2)

    return results

# Split the sanitized query string into sub-parts and
# generate a mongo query for eachself.
def queryAllWords(safe):
    # 5 types of queries
    #types = {ZERO: [], DEPT: [], NUM: [], DIST: [], TIT1: [], TIT2: []} # if list is empty, then don't consider it in union (to prevent empty results)
    types = {}
    words = safe.split()
    #results = []
    for word in words:
        #results.append(queryOneWord(word))
        current, queryType = queryOneWord(word)
        if queryType not in types.keys():
            types[queryType] = current
        else:
            types[queryType] = types[queryType].union(current)
    # take intersection of types of queries now
    results = set()
    alreadyTraversed = False
    for lists in types.values():
        if alreadyTraversed:
            results = results.intersection(lists)
        else:
            results = lists
            alreadyTraversed = True
    finalResults = []
    for course in results:
        finalResults.append(loads(course))
    return finalResults


# public variant of queryAllWords called by landing.py
def course_db_query(safe):
    return queryAllWords(safe)
    # version with just one word
    #print(safe)
    #return queryOneWord(safe)
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

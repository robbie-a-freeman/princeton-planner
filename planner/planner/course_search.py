# ----------------------------------------------------------------------------
# course_search.py
# ----------------------------------------------------------------------------

# This program takes in an *unsanitized* query string from the user,
# sanitizes it to reduce the risk of injection-style attacks, and
# then generates a MongoDB query that will search the database to satisfy
# the user's queryself.

# This program is not responsible for: processing the POST server query,
# Sending the MongoDB query to MongoDB, or receiving the results of the mongodb
# query, or repackaging the results for use in the frontend HTMLself.

#   We consider a type of search which is a slightly more complex form of the intersection
#   of queries that we implemented in reg.py. We will consider the query string types
#   and take the intersection of the courses in each query string type.
#   For example, if the query string is "COS 333 ENG", then we could have two types:
#   DEPT: set(["COS", "ENG"])
#   NUMBER: set([333])
#   We take the intersection of the types of courses to obtain the final result list.
#
#   However, we need to consider names/titles of courses. If there is any query longer than 4 letters...
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

import os, re
from pymongo import MongoClient

# to handle BSON types
from bson.json_util import dumps, loads

# Fetch the URI from environment variable to avoid leaking credentials.
mongoURI = os.environ.get('MONGOLAB_URI')
client = MongoClient(mongoURI)
db = client.plannerdb

# TYPES OF QUERIES
ZERO = 0
DEPT = 1
NUM = 2
DIST = 3
TIT1 = 4
TIT2 = 5
DENUM1 = 6
DENUM2 = 7
DENUM3 = 8

# Three letter course codes for Princeton University departments
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

# Two letter course codes for Princeton University course distribution areas
dist_ids = set(("EC", "EM", "HA", "LA", "QR", "SA", "STL", "STN"))

# Sanitizes input (keep in case future inputs change)
def sanitize(unsafe):
    return unsafe

# Given a single sub-part of the query string, generate the
# corresponding Mongo query, and return the results of the
# Mongo query, as an array of stringified json objects
# along with the query type
def queryOneWord(word, semester):
    # current semester
    sem = parse_semester(semester)
    courses = db['courses' + parse_semester(semester)]

    uWord = word.upper()
    results = set()
    queryType = ZERO

    re_obj = {"$regex":word, "$options":"i"}

    if len(word) <= 1:
        queryType = ZERO
        return (results, queryType)

    # Dept. ID:
    elif uWord in dept_ids:
        results = set([dumps(course) for course in courses.find( {"listings.dept":uWord} ) ])
        queryType = DEPT

    # Course number:
    elif re.match("\d\d\d", word):
        results = set([dumps(course) for course in courses.find( {"listings.number":uWord} ) ])
        queryType = NUM

    # Dept. ID no spaces followed by course number:
    elif re.match("[A-Z][A-Z][A-Z]\d\d\d", uWord):
        results = set([dumps(course) for course in courses.find( {"listings.dept":uWord[0:3]} ) ])
        results = results.intersection([dumps(course) for course in courses.find( {"listings.number":uWord[3:]} ) ])
        queryType = DENUM3

    # Dept. ID no spaces followed by course number:
    elif re.match("[A-Z][A-Z][A-Z]\d\d", uWord) or re.match("[A-Z][A-Z][A-Z] \d\d", uWord):
        results = set([dumps(course) for course in courses.find( {"listings.dept":uWord[0:3]} ) ])
        results = results.intersection([dumps(course) for course in courses.find( {"listings.number": {"$regex": uWord[3:] + "\d", "$options": "i"}} ) ])
        queryType = DENUM2

    # Dept. ID no spaces followed by course number:
    elif re.match("[A-Z][A-Z][A-Z]\d", uWord) or re.match("[A-Z][A-Z][A-Z] \d", uWord):
        results = set([dumps(course) for course in courses.find( {"listings.dept":uWord[0:3]} ) ])
        results = results.intersection([dumps(course) for course in courses.find( {"listings.number": {"$regex": uWord[3:] + "\d\d", "$options": "i"}} ) ])
        queryType = DENUM1

    # Dist. ID:
    elif uWord in dist_ids:
        results = set([dumps(course) for course in courses.find( {"area": uWord}) ])
        queryType = DIST

    # Len <= 2:
    elif len(word) <= 2:
        results = set([dumps(course) for course in courses.find( {"listings.dept":   re_obj} )])
        results = results.union([dumps(course) for course in courses.find( {"listings.number": re_obj} )])
        results = results.union([dumps(course) for course in courses.find( {"title":           re_obj} )])
        queryType = TIT1

    # Len >= 3:
    else:
        results = set([dumps(course) for course in courses.find( {"title":           re_obj} )])
        queryType = TIT2

    return (results, queryType)

# Split the sanitized query string into sub-parts and
# generate a mongo query for eachself.
def queryAllWords(safe, semester):
    types = {}
    words = safe.split()
    for word in words:
        currentResult, queryType = queryOneWord(word, semester)
        if queryType not in types.keys():
            types[queryType] = currentResult
        else:
            types[queryType] = types[queryType].union(currentResult)
    # take intersection of types of queries
    results = set()
    alreadyTraversed = False
    for courseList in types.values():
        if alreadyTraversed:
            results = results.intersection(courseList)
        else:
            results = courseList
            alreadyTraversed = True
    finalResults = []
    for course in results:
        finalResults.append(loads(course))
    # sorts by department and then course number
    list.sort(finalResults, key=lambda dept: (dept["listings"][0]["dept"], dept["listings"][0]["number"]))
    return finalResults

# parses semester input - takes first character and last two characters
def parse_semester(semester):
    final_form = semester[0] + semester[len(semester) - 2:]
    return final_form

# public variant of queryAllWords called by landing.py
def course_db_query(query, semester):
    safe = sanitize(query)
    return queryAllWords(safe, parse_semester(semester))


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
    results = queryAllWords(testWord)
    for result in list(results):
        print(getCourseTag(loads(result)))
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


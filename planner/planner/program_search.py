# ----------------------------------------------------------------------------
# program_search.py
# ----------------------------------------------------------------------------

import os, re
from pymongo import MongoClient


#client = MongoClient('localhost', 27017)
#db = client.test      # Remember to change in vagrant_up if this changes
#courses = db.courses


# Fetch the URI from environment variable to avoid leaking credentials.
mongoURI = os.environ.get('MONGOLAB_URI')
client = MongoClient(mongoURI)
db = client.plannerdb
majors = db.majors
certificates = db.certificates
#programs = db.programs

# Sanitize the input string.
# MUST IMPLEMENT THIS!!!
def sanitize(unsafe):

    # This doesn't do much sanitizing right now!
    return unsafe

# Given a single sub-part of the query string, generate the
# corresponding Mongo query, and return the results of the
# Mongo query, as an array of json objects (strings or objects?)
def queryOneWord(word):
    word = word.upper().strip()
    results = []

    re_obj = {"$regex":word, "$options":"i"}

    # Ignore short queries
    if len(word) <= 1:
        return results

    # Combine code & fullname searches
    else:
        results  = [maj for maj in majors.find( {"name":       re_obj} ) ]
        results += [maj for maj in majors.find( {"track":      re_obj} ) ]
        results += [maj for maj in majors.find( {"short_name": re_obj} ) ]
        results += [cert for cert in certificates.find( {"name":       re_obj} ) ]
        results += [cert for cert in certificates.find( {"short_name": re_obj} ) ]

        # Remove duplicates.
        results = [i for n, i in enumerate(results) if i not in results[n + 1:]]
    return results

# Split the sanitized query string into sub-parts and
# generate a mongo query for eachself.
### NOTE NOT YET IMPLEMENTED!!!!
def queryAllWords(safe):
    words = safe.split()
    results = []
    for word in words:
        results.append(queryOneWord(word))
    return results


# public variant of queryAllWords called by landing.py
def program_db_query(query):
    # NEED TO IMPLEMENT SANITIZE!
    safe = sanitize(query)
    return queryOneWord(safe)


### Helper functions

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

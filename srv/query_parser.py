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
#
#   Any other string (not dept id, not distr, len >= 3)
#       match against  Match against "title" : str
#
# =====================================================================

import re
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.test      # Remember to change in vagrant_up if this changes
courses = db.courses

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

# Sanitize the input string.
# MUST IMPLEMENT THIS!!!
def sanitize(unsafe):
    # This doesn't do much sanitizing right now!
    return unsafe

# Given a single sub-part of the query string, generate the
# corresponding Mongo query, and return the results of the
# Mongo query, as a json-style object.
def queryOneWord(word):
    # Dept. ID:
    if word in dept_ids:
        return courses.find( {"listings.dept":word} )


    # Course number:

    #


# Split the sanitized query string into sub-parts and
# generate a mongo query for eachself.
def queryAllWords(safe):
    words = safe.split(" ")
    results = []
    for word in words:
        results.append(queryOneWord(word))
    return results

# Return the 6-digit course tag (COS333) for a json result
# Primarily for debugging right now.
def getCourseTag(result):
    return result['listings'][0]['dept'] + result['listings'][0]['number']

def main():
    results = queryOneWord("COS")
    for result in results:
        print(getCourseTag(result))

main()
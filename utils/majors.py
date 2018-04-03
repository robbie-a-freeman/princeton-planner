import json
import os

def main():
    print("Enter a json filename to expand:")
    filename = input()

    if ".json" not in filename:
        print("Invalid filename...")
        print("Creating new file: majors.json")
        filename = "majors.json"

    json_old = []
    if os.path.exists(filename) and os.path.isfile(filename):
        file_r = open(filename, "r")
        json_old = json.load(file_r)
        file_r.close()

    file_w = open(filename, "w+")
    

    #now ignore all that other shit for safety

    majors = json_old

    while(True):

        if (input("Add another major to list? (y/n) ")).lower() != "y":
            break
        
        major = {}

        addField(major, "name", input("Enter a major name: "))
        addField(major, "designation", input("3-letter major code: "))
        addField(major, "type", input("BSE or AB "))

        requirements = []
        while(True):
            inStr = input("COURSE or LIST of courses or other to stop ")
            # Read in a new single course
            if inStr.lower() == "course":
                newCourse = promptCourse()
                if newCourse is None:
                    break #shouldnt happen
                requirements.append(newCourse)
            # Read in a new list of requirements
            elif inStr.lower() == "list":
                newList = promptList()
                if newList is None:
                    break #shouldnt happen
                requirements.append(newList)
            # All requirements read in; add to major
            else:
                addField(major, "requirements", requirements)
                break

        majors.append(major)

    print(majors)
    json.dump(majors, file_w)
    file_w.close()
    


    
#Set parent[field] = value unless any arg is None or ""
def addField(parent, field, value):
    if parent is None or field is None or value is None:
        return
    if parent == "" or field == "" or value == "":
        return
    parent[field] = value

def promptCourse():
    course = {"type": "course"}
    addField(course, "department", input("Enter a 3 letter dept ID: "))
    addField(course, "number", input("Enter 3 digit course ID: "))
    #print(course)
    if course == {"type" : "course"}:
        return None
    else:
        return course


def promptList():
    courseList = {"type": "list"}
    addField(courseList, "quantity", int(input("Enter # req'd from this list: ")))
    addField(courseList, "name", input("Enter a name for this course categoy (e.g. Computer Systems): "))
    courses = []
    while(True):
        if (input("Add another course to list? (y/n) ")).lower() != "y":
            break
        courses.append(promptCourse())
    addField(courseList, "courses", courses)
    #print(courseList)
    if courseList == {"type": "list"}:
        return None
    else:
        return courseList

main()

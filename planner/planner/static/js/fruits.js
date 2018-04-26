var transcript = JSON.parse('{"transcript": {"courses": {"Spring 2017": ["PHY 104", "KOR 108", "WRI 150", "MAT 202", "COS 226"], "Fall 2017": ["ELE 206", "COS 217", "ORF 245", "KOR 301", "COS 324"], "Fall 2016": ["PHY 103", "KOR 103", "COS 126", "MAT 216"]}, "grades": {"MAT 202": "A-", "KOR 301": "A", "MAT 216": "A-", "COS 324": "B+", "PHY 104": "A", "PHY 103": "A", "ELE 206": "A", "COS 217": "B+", "WRI 150": "A", "KOR 103": "A", "ORF 245": "A-", "COS 226": "A-", "KOR 108": "A", "COS 126": "A"}}, "user": {"first_name": "PHILLIP", "last_name": "YOON", "netid": "pyoon"}}');

function myFunction() {
    var i;
    var text = "<tbody>"
    var e = document.getElementById("semester");
    var semester = e.options[e.selectedIndex].text;
    document.getElementById("demo").innerHTML = semester;
    if (transcript["transcript"]["courses"].hasOwnProperty(semester)) {
        for (i = 0; i < transcript["transcript"]["courses"][semester].length; i++) { 
            text += "<tr><td>" + transcript["transcript"]["courses"][semester][i] + "</td></tr>";
        }
    }
    else {
        text += "<tr><td>EMPTY</tr></td>";
    }
    text += "</tbody>";
    document.getElementById("enrolled").innerHTML = text;
}



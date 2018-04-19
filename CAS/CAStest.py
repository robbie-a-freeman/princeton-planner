#!/usr/local/python/current/bin/python
import _ssl;_ssl.PROTOCOL_SSLv23 = _ssl.PROTOCOL_SSLv3


import CASClient

C = CASClient.CASClient()
netid = C.Authenticate()

print "Content-Type: text/html"
print ""

import os

print "Hello from the other side, %s\n" % netid

print "<p>Think of this as the main page of your application after %s has been authenticated." % (netid)

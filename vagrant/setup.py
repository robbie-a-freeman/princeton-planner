# This program is basically useless in its current version (after vagrant setup was revamped.)
# Nothing would break if we got rid of it.

import shutil
import os
from subprocess import call

def main():
    # execute vagrant and ssh in
    print("Starting vagrant instance...")
    call(["vagrant", "up"])
    call(["vagrant", "ssh"])

main()

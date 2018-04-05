import shutil
import os
from subprocess import call

def main():
    # execute vagrant and ssh in
    print("Starting vagrant instance...")
    call(["vagrant", "up"])
    call(["vagrant", "ssh"])

main()

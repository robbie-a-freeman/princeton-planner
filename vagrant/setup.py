import shutil
import os
from subprocess import call

targetPath = "./../../vagrant"

def main():
    # overwrite existing vagrant files.
    if (os.path.isdir(targetPath)):
        reply = input("The vagrant folder already exists. Overwrite? (y/n)")
        if (reply == 'y' or reply == 'Y'):
            # print(targetPath)
            print("Deleting old vagrant files...")
            shutil.rmtree(targetPath)
        else:
            print("Auto-copy failed. Manually set up your vagrant folder.")
            return

    # copy repo vagrant files to local machine.
    print("Copying new vagrant files...")
    shutil.copytree(".", targetPath)
    # Prevent against accidental recursive setup.
    os.remove(targetPath + "/setup.py")
    os.rename(targetPath + "/Vagrantfile_Src", targetPath + "/Vagrantfile")

    # navigate to new directory and execute vagrant
    os.chdir(targetPath)
    print("Starting vagrant instance...")
    call(["vagrant", "up"])
    call(["vagrant", "ssh"])

main()

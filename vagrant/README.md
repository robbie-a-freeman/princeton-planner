# Vagrant Virtual Machine (VM) Startup Files

This is a collection of files to get started with a Python project using vagrant.

## A) Set up a project to use vagrant
1. Download and install [vagrant](https://www.vagrantup.com/downloads.html).
2. Download and install [VirtualBox](https://www.virtualbox.org/wiki/VirtualBox).
3. Place all files (`Vagrantfile`, `vagrant_up.sh`, `vagrant_down.sh`, `requirements.txt`) in your project's root directory. If you do not have a project, and would just like to use a VM for development purposes, create any folder with the files.
4. In a terminal, go to the directory in which you just copied the files, and fire the VM:
```
$ vagrant up
```

## B) Destroy a VM
If you have launched a VM by using the command `vagrant up`, you can shut down the virtual machine by running the following from the directory in which the `Vagrantfile` is contained:
```
$ vagrant destroy
```

## C) Accessing the VM

- The VM can be accessed through SSH, by running the following from the directory in which the `Vagrantfile` is contained:
```
$ vagrant ssh
```
- After connecting by SSH to the VM, you can leave the prompt by typing:
```
$ exit
```
- In provided `Vagrantfile`, port 80 of the VM is forwarded to port 8000 of your host machine. This means that if you start a webserver on port 80 of the VM, you can access it from your host computer by going to http://localhost:8000.

- All files and folders contained in the same directory as `Vagrantfile` can be accessed from an SSH prompt by going to the folder `/vagrant/` on the VM.

#!/usr/bin/env bash
# This gets run every time the VM is re-initialized or re-provisioned

# Set non-interactive installs and updates
sudo dpkg-reconfigure -f noninteractive debconf
sudo DEBIAN_FRONTEND=noninteractive apt-get -y update
sudo DEBIAN_FRONTEND=noninteractive apt-get -qq -y upgrade

# sudo aptitude -y update
# sudo aptitude -y upgrade

# for batch install (i.e., no intervention)
sudo aptitude -y install debconf-utils

# to run the Django local server process in the background
sudo aptitude -y install screen

# Install easy_install and pip
sudo aptitude -y install python-pip
sudo pip install -U pip
sudo python -m pip install --upgrade pip setuptools wheel

# curl
sudo apt-get install -y curl

# sudo aptitude -y install python-setuptools
# sudo easy_install pip

# Install requests through pm (issue with pip package)
sudo aptitude -y install python-requests

# Install PostgreSQL extension dependencies
## sudo aptitude -y install python-dev
## sudo aptitude -y install postgresql
## sudo aptitude -y install libpq-dev
## sudo aptitude -y install python-psycopg2

# Install MongoDB
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/ when something breaks
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.6 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install emacs
sudo apt-get -y install emacs

# lxml package dependencies
sudo aptitude -y install libxml2-dev
sudo aptitude -y install libxslt-dev

# Pillow package dependencies
sudo aptitude -y install libjpeg8-dev
sudo aptitude -y install libjpeg-dev

# Install pdftotext
sudo aptitude -y install poppler-utils

# Install python project requirements
sudo pip install -r /vagrant/vagrant/requirements.txt

# If we needed to, we could start a server (such as Django) this way
# start the server
#screen -dmS djangoproc bash -c 'python /vagrant/projectname/manage.py runserver 0.0.0.0:8000'

# then quit with
#screen -S djangoproc -X quit

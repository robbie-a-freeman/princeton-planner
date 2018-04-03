#!/usr/bin/env bash

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
pip install -U pip

# sudo aptitude -y install python-setuptools
# sudo easy_install pip

# Install requests through pm (issue with pip package)
sudo aptitude -y install python-requests

# Install PostgreSQL extension dependencies
## sudo aptitude -y install python-dev
## sudo aptitude -y install postgresql
## sudo aptitude -y install libpq-dev
## sudo aptitude -y install python-psycopg2

# lxml package dependencies
sudo aptitude -y install libxml2-dev
sudo aptitude -y install libxslt-dev

# Pillow package dependencies
sudo aptitude -y install libjpeg8-dev
sudo aptitude -y install libjpeg-dev

# Install pdftotext
sudo aptitude -y install poppler-utils

# Install python project requirements
sudo pip install -r /vagrant/requirements.txt

# If we needed to, we could start a server (such as Django) this way
# start the server
#screen -dmS djangoproc bash -c 'python /vagrant/projectname/manage.py runserver 0.0.0.0:8000'

# then quit with
#screen -S djangoproc -X quit

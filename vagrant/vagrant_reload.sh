#!/usr/bin/env bash
# This script gets executed every time the VM is started

# Start MongoDB
sudo service mongod start

# Scrape courses.json using scraper.py (or use backup if this fails)
# python /vagrant/utils/scraper.py > /vagrant/utils/current_courses.json

# Populate MongoDB with /vagrant/data/courses.json
# Remember to change in query_parser.py if this changes.
mongoimport --db=test --collection=courses --drop --file=/vagrant/data/courses.json --jsonArray

# Set will's .bashrc profile.
echo 'Copying bash profile...'
cp -fv /vagrant/vagrant/.bashrc ~/.bashrc || echo 'Copy successful'

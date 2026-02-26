#!bin/bash

#PRODUCTION
git reset--hard
git checkout main
git pull origin master

docker compose up -d
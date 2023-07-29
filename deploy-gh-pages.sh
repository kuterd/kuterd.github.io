#!/bin/bash

#Simple script for deploying this blog to github pages.
python main.py
git add result

git commit -m "Subtree"
git push upstream `git subtree split --prefix result main`:gh-pages --force
git reset --hard HEAD~1

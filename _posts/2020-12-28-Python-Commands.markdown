---
layout: post
title:  Python Useful Commands
date:   2020-12-28 16:54
image:  oop.jpg
tags:   [Fundation, Python]
---

### How to setup project locally?

1. CD into project folder and run `python3 -m venv ven` to create an environment.
2. Activate the environment `. venv/bin/activate`.
3. Install Packages: `python3 -m pip install -r requirements.txt`. 

### How to run flask project?

1. Start the app by running: `export FLASK_APP=one_click_share.py`.
2. Set environment to development: `export FLASK_ENV=development`
3. Then run: `flask run` to start the server.

### How to run you localhost with HTTPS?

1. Install pyopenssl `python3 -m pip install pyopenssl`
2. Start Flask Server: `flask run --cert=adhoc`

### How to automatically create requirements.txt

`python3 -m pip freeze > requirements.txt`
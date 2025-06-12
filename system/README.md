# HypoCompass

This repository contains the code for the HypoCompass Training System. Follow the instructions below to set up, run, and manage the system.


## Install environment

### Install frontend dependencies
```
cd frontend
npm install (add --force flag if necessary)
```

### Install backend dependencies
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Run the system locally

Activate backend venv 
```
cd backend
source .venv/bin/activate
```

Do npm commands below from the frontend directory, 
and serve the backend and frontend in two different terminal windows.

### 1. Serve backend in one terminal [-> localhost:8090](http://127.0.0.1:8090)
```
cd frontend
npm run backend
```
Note that backend host & port is specified in both package.json -> proxy and base.py -> app.run

Log data will be collected under the folder `backend/data`.

### 2. Serve frontend in another terminal [-> localhost:8080](http://localhost:8080/)
```
npm start
```
Since the system was developed with a legacy version of Node.js, you may need to use
```
NODE_OPTIONS=--openssl-legacy-provider npm start
```
Note that the frontend port is specified in package.json -> scripts -> start 


## Add New Question
Add all the generated materials in the backend in similar format to existing examples like `num_smaller` and `remove_extras`.


## Trouble Shooting

If your Node.js & npm version doesn't works, consider the following combinations:
```
$node --version
v16.19.1
$npm --version
9.6.2
```
OR
```
➜ node --version 
v16.17.0
➜ npm --version         
8.15.0
```


If in need of reinstalling packages, you may want to do these
```
rm -rf node_modules && rm -f package-lock.json && npm i
npm cache clean --force
```

If you see an error "Browserslist: caniuse-lite is outdated," you may need to run:
```
npx update-browserslist-db@latest
```
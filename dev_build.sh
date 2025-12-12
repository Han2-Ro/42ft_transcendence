#!/bin/bash

cd backend
npm i
npm run build 
npm run start&

cd ../frontend
npm i
npm run dev
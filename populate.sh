#!/bin/bash


LOCAL_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+')

sed -i "s/localhost/$LOCAL_IP/g" .env
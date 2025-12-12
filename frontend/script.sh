#!/bin/bash

npm run build

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/nginx/cert.key \
-out /etc/nginx/cert.crt \
-subj "/c=AT/l=Vienna/O=1337/OU=student/CN=fstark.42.fr"

nginx -g "daemon off;"



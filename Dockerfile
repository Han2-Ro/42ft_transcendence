FROM node:20-alpine

RUN apk update && apk add --no-cache \
	bash \
	nginx \
    openssl \
	bash \
    ca-certificates \
    curl

WORKDIR /app

COPY . .

RUN npm install

# Replace NGINX configuration file
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

#Open port in
EXPOSE 443

RUN chmod +x ./script.sh

CMD ["./script.sh"]
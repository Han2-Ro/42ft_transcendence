FROM node:20-alpine 

RUN apk update && apk add --no-cache \
	bash 

WORKDIR /app

#Open port in
#EXPOSE 443

#Copy the necessary files
COPY . .

RUN npm install

#Make script executable
RUN chmod +x ./script.sh
RUN chmod +x ./src/app.ts

#execute script
CMD ["./script.sh"]

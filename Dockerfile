# pull official base image
FROM node:latest

# set working directory
WORKDIR /smachd

# add `/smachd/node_modules/.bin` to $PATH
ENV PATH /smachd/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent

# add app
COPY . ./

# Build app
RUN npm run build

# Deploy using ngnix
FROM nginx:alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY /smachd/build /usr/share/nginx/html
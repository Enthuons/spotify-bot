# using ubuntu as base image
FROM ubuntu:18.04

# update ubuntu
RUN apt update
RUN apt upgrade -y

# install required softwares
RUN apt install wget curl unzip xvfb libxss1 npm -y
RUN apt install -f -y

# install latest node
RUN npm install -g n
RUN n latest

WORKDIR /temp

# install chrome browser
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt install -f -y
RUN rm google-chrome-stable_current_amd64.deb

# install chrome driver
RUN wget https://chromedriver.storage.googleapis.com/75.0.3770.8/chromedriver_linux64.zip
RUN unzip chromedriver_linux64.zip
RUN chmod +x chromedriver
RUN mv chromedriver /usr/bin/
RUN rm chromedriver_linux64.zip

# setup google chrome to run without display
RUN echo "export DISPLAY=:1" >> /usr/bin/google-chrome
RUN Xvfb :1 -screen 0 640x480x8 &

# switch to app directory
WORKDIR /app

# setup project files
COPY package.json .
COPY package-lock.json .

# install project dependencies
RUN npm install

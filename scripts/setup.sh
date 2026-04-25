#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo $0"
  exit 1
fi

if command -v docker compose &> /dev/null; then
	echo "docker compose already installed..."
	if command -v make &> /dev/null; then
		echo "make already installed, exiting..."
		exit 0
	else
		sudo apt install make -y
		echo "make installed"
	fi
	exit 0
fi

# Removing all docker packages that could cause issues
sudo apt remove -y $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc | cut -f1)

# Setting up docker apt repository
# Add Docker's official GPG key:
sudo apt update -y
sudo apt install ca-certificates curl -y
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update -y

# Installing latest docker image
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Installing make
sudo apt install make -y

# Giving user rights to run docker without sudo
sudo setfacl -m user:$SUDO_USER:rw /var/run/docker.sock
# SolarCoin

# Development
node server.js

# Deployment
## According to https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
docker build . -t jonathanlehner/solarchain
docker run -p 49160:8080 -d jonathanlehner/solarchain
## remotely (make sure you installed docker on DigitalOcean)
docker push jonathanlehner/solarchain
DOCKER_HOST=ssh://root@167.172.191.194 docker run -p 49160:8080 -d jonathanlehner/solarchain

ssh root@167.172.191.194
apt  install certbot
certbot
scp root@167.172.191.194:/etc/letsencrypt/live/peer2panel.com/fullchain.pem fullchain.pem
scp root@167.172.191.194:/etc/letsencrypt/live/peer2panel.com/privkey.pem privkey.pem

`streamlit run app.py`

`npm i && npm run start`

# How to use with UI
- https://github.com/PureStake/algosigner-dapp-example 
- https://github.com/algorand/smart-contracts

# create assets with UI
- https://developer.algorand.org/articles/getting-started-assets/
- https://developer.algorand.org/solutions/algorand-asset-management-portal/
- - https://developer.algorand.org/articles/building-nfts-on-algorand/

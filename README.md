## Developers - Group 2
- Marc AROLD ROSEMOND : marc.arold-rosemond@etu.univ-grenoble-alpes.fr</br>
- Ayla DIONE : ayla.dione@etu.univ-grenoble-alpes.fr</br>
- Leo JACQUET : leo.jacquet@etu.univ-grenoble-alpes.fr</br>
- Kylian DESCHAMPS : kylian.deschamps@etu.univ-grenoble-alpes.fr</br>
- Valentin LUGINBUHL : valentin.luginbuhl@etu.univ-grenoble-alpes.fr</br>

## Credits
- Assets : https://pixelfrog-assets.itch.io/tiny-swords
- Fonts : https://fonts.google.com/specimen/Caprasimo
- Effects : https://codepen.io/ValentinBossens/pen/BaKRwea

## Prerequisites
- NodeJS : https://nodejs.org/en/download/
- MongoDB : https://www.mongodb.com/try/download/community
- Cordova : https://cordova.apache.org/docs/en/13.x-2025.11/guide/cli/installation.html

# 💿 - Lunch *Client*
```bash
npm install
```
```bash
cordova platform add browser
```
```bash
cordova run browser
```

# 💿 - Lunch *Server*
```bash
cd ./server
```
```bash
npm install
```
```bash
cp .env-example .env
```
```bash
node src/scripts/seed.js
```
```bash
node server.js
```
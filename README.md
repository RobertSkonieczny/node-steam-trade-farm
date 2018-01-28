# node-steam-trade-farm STILL UNDER TESTING!!!!

This is a Steam BOT, that takes 2 of your accounts, and makes trades in order to bump up 'Trades Done' on your Steam Profile.



## Getting Started
For you to get started you need the following
```
NODEJS
NPM Package Installer
Your Identity Secret
Your Shared Secret
```

### Installing

First off get your Identity Secret, and Shared Secret. Read this Thread here https://forums.backpack.tf/index.php?/topic/46354-guide-how-to-find-the-steam-identity_secret-on-an-android-phone/

Fill in config.json

After this open console, and write the following.
```
mkdir steam-trade-farm
npm install steam-user
npm install steam-tradeoffer-manager
npm install steamcommunity
npm install steam-totp
npm install fs
npm install sleep 

```

After this make way to this directory, and drop in the code.
Once this is complete type the following into Command Prompt.

***************** IF YOU GET AN ISSUE WITH NPM INSTALL SLEEP ********************

Type these 3 commands

npm install --global node-gyp

npm --add-python-to-path='true' --debug install --global windows-build-tools

npm install --global --production windows-build-tools


```
cd steam-trade-farm
node bot
```

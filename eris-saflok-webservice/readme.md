# Eris Saflok webservice

## Setup

### Project
```
npm install
```
### Test Chain
```
cd test
eris keys import chain-config/export-account
eris chains new hello --dir chain-config
```

### Contract Deployment
In Bash Shell:
```
cd contracts
account=$(sed -n -e '/Id/ s/.*Id\":\"\([[:alnum:]]*\)\".*$/\1/p' ../test/chain-config/export-account)
eris pkgs do -c hello -a $account
```

### Application
- Run the test/hello-test.js mocha/chai test script to invoke some basic JS functions
- Use a REST client / browser with the following URLs:
 - POST http://localhost:3080/saflok Body: `{"id": "001", "expiryDate": "10-10-2016", "expiryTime": "13:00", "room": A101}`
 - GET http://localhost:3080/saflokKeys
 - GET http://localhost:3080/saflok/001



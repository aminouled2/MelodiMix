import * as fs from 'fs'
import path = require('path');

async function storeToken(email, token) {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(__dirname, '..', '..', 'db', 'userTokens.json'), 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
  
        let userTokens;
        try {
          userTokens = JSON.parse(data);
        } catch (error) {
          reject(new Error("Invalid userTokens JSON data"));
          return;
        }
  
        if (userTokens[email]) {
          reject(new Error("User already exists"));
          return;
        }
  
        userTokens[email] = { token: token };
  
        fs.writeFile(path.join(__dirname, '..', '..', 'db', 'userTokens.json'), JSON.stringify(userTokens, null, 2), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve({ "success": true });
          }
        });
      });
    });
  }

export { storeToken }
import * as fs from 'fs'
import path = require('path');

async function storeToken(email, token, userId) {
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

      if (userTokens[email] && userTokens[email].token == token) {
        reject(new Error("User already exists"));
        return;
      }

      userTokens[email] = { token: token, userId: userId };

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

async function fetchToken(email) : Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '..', '..', 'db', 'userTokens.json'), 'utf8', (err, data) => {
      const userTokens = JSON.parse(data);
      if (err) {
        reject(err);
        return;
      }
      
      if (userTokens[email]) {
        resolve(userTokens[email].token);
      } else {
        reject("User doesn't exist");
        return;
      }

    })
  })
}
async function fetchUserId(email) : Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '..', '..', 'db', 'userTokens.json'), 'utf8', (err, data) => {
      const userTokens = JSON.parse(data);
      if (err) {
        reject(err);
        return;
      }
      
      if (userTokens[email]) {
        resolve(userTokens[email].userId);
      } else {
        reject("User doesn't exist");
        return;
      }

    })
  })
}

export { storeToken, fetchToken, fetchUserId }
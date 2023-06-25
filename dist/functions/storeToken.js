"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeToken = void 0;
const fs = require("fs");
const path = require("path");
function storeToken(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '..', '..', 'db', 'userTokens.json'), 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                let userTokens;
                try {
                    userTokens = JSON.parse(data);
                }
                catch (error) {
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
                    }
                    else {
                        resolve({ "success": true });
                    }
                });
            });
        });
    });
}
exports.storeToken = storeToken;

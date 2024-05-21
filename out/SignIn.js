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
function SignIn() {
    return __awaiter(this, void 0, void 0, function* () {
        // make a GET api call to app.keploy.io and get an access token and store it in the global state
        const response = yield fetch('https://app.keploy.io/signin?extension=true', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = yield response.json();
        // const data = {
        //     accessToken : "1234567890"
        // };
        return data;
    });
}
exports.default = SignIn;
//# sourceMappingURL=SignIn.js.map
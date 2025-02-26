"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWallet = generateWallet;
const web3_js_1 = require("@solana/web3.js");
const fs = __importStar(require("fs"));
function generateWallet() {
    // Generate a new random keypair
    const keypair = web3_js_1.Keypair.generate();
    // Get the public key in base58 format
    const publicKey = keypair.publicKey.toString();
    // Get the private key (secret key) as a byte array
    const secretKey = Buffer.from(keypair.secretKey).toString("base64");
    console.log("Public Key:", publicKey);
    console.log("Private Key (Base64):", secretKey);
    // To save the keypair to a file:
    fs.writeFileSync("keypair.json", JSON.stringify({
        publicKey: publicKey,
        privateKey: secretKey,
    }));
    return { publicKey, secretKey };
}
// Only run if this file is being executed directly
if (require.main === module) {
    generateWallet();
}
// IMPORTANT SECURITY NOTES:
// 1. Never share your private key
// 2. Store it securely
// 3. Consider using a hardware wallet for production use
// // 4. The file 'keypair.json' should be kept secure and not committed to version control
//# sourceMappingURL=generateWallet.js.map
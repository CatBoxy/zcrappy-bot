"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueToken = generateUniqueToken;
function generateUniqueToken() {
    return Math.random().toString(36).substr(2, 9);
}

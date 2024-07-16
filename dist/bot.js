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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramAlert = exports.bot = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const supabase_js_1 = require("@supabase/supabase-js");
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const serviceKey = process.env.SERVICE_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const token = process.env.ZARADROPSBOT_TOKEN;
const telegramTokenTable = "Telegram_token";
const userTable = "User";
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceKey);
exports.bot = new node_telegram_bot_api_1.default(token, { polling: true });
exports.bot.onText(/\/start/, (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chatId = msg.chat.id;
    const userId = (_a = msg.from) === null || _a === void 0 ? void 0 : _a.id;
    const uniqueToken = (0, utils_1.generateUniqueToken)();
    const { data, error } = yield supabase
        .from(telegramTokenTable)
        .insert([{ telegram_user_id: userId, token: uniqueToken }]);
    if (error) {
        if (error.code === "23505") {
            exports.bot.sendMessage(chatId, "Ya se ha enviado un código, por favor dirijase a nuestra pagina web para completar la configuracion de su cuenta.");
            return;
        }
        exports.bot.sendMessage(chatId, "Ocurrio un error, por favor intente nuevamente mas tarde.");
        console.error(error);
        return;
    }
    exports.bot.sendMessage(chatId, `Por favor, ingrese el siguiente código en nuestro sitio web para vincular su cuenta de Telegram.: ${uniqueToken}`);
}));
const sendTelegramAlert = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase
        .from(userTable)
        .select("telegram_id")
        .eq("uuid", userId)
        .single();
    if (error || !data.telegram_id) {
        console.error("Failed to retrieve Telegram ID");
        return;
    }
    const telegramId = data.telegram_id;
    exports.bot.sendMessage(telegramId, message);
});
exports.sendTelegramAlert = sendTelegramAlert;

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
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const bot_1 = require("./bot");
const supabase_js_1 = require("@supabase/supabase-js");
const router = express_1.default.Router();
router.post("/send-alert", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, message } = req.body;
    if (!userId || !message) {
        return res.status(400).json({ error: "Missing userId or message" });
    }
    try {
        yield (0, bot_1.sendTelegramAlert)(userId, message);
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send alert" });
    }
}));
router.post("/link-telegram", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, userId } = req.body;
    const serviceKey = process.env.SERVICE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const telegramTokenTable = "Telegram_token";
    const userTable = "User";
    const supabase = (0, supabase_js_1.createClient)(supabaseUrl, serviceKey);
    const { data: tokenData, error: tokenError } = yield supabase
        .from(telegramTokenTable)
        .select("telegram_user_id")
        .eq("token", token)
        .single();
    if (tokenError || !tokenData) {
        return res.status(400).send({ message: "Token vencida o no existente." });
    }
    const telegramId = tokenData.telegram_user_id;
    const { data, error } = yield supabase
        .from(userTable)
        .update({ telegram_id: telegramId })
        .eq("uuid", userId);
    if (error) {
        return res
            .status(500)
            .send({ message: "Error al enlazar cuenta de Telegram." });
    }
    yield supabase.from(telegramTokenTable).delete().eq("token", token);
    res
        .status(200)
        .send({ message: "Cuenta de Telegram enlazada satisfactoriamente." });
}));
exports.routes = router;

import express from "express";
import { Request, Response } from "express";
import { sendTelegramAlert } from "./bot";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

router.post("/send-alert", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "Missing userId or message" });
  }

  try {
    await sendTelegramAlert(userId, message);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send alert" });
  }
});

router.post("/link-telegram", async (req: Request, res: Response) => {
  const { token, userId } = req.body;
  const serviceKey: string = process.env.SERVICE_KEY!;
  const supabaseUrl: string = process.env.SUPABASE_URL!;
  const telegramTokenTable: string = "Telegram_token";
  const userTable: string = "User";
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: tokenData, error: tokenError } = await supabase
    .from(telegramTokenTable)
    .select("telegram_user_id")
    .eq("token", token)
    .single();

  if (tokenError || !tokenData) {
    return res.status(400).send({ message: "Token vencida o no existente." });
  }

  const telegramId = tokenData.telegram_user_id;

  const { data, error } = await supabase
    .from(userTable)
    .update({ telegram_id: telegramId })
    .eq("uuid", userId);

  if (error) {
    return res
      .status(500)
      .send({ message: "Error al enlazar cuenta de Telegram." });
  }

  await supabase.from(telegramTokenTable).delete().eq("token", token);

  res
    .status(200)
    .send({ message: "Cuenta de Telegram enlazada satisfactoriamente." });
});

export const routes = router;

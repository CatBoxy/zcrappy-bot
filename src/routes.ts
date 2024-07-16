import express from "express";
import { sendTelegramAlert } from "./bot";

const router = express.Router();

router.post("/", async (req, res) => {
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

export const sendAlertRouter = router;

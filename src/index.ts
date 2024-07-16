import express from "express";
import { bot } from "./bot";
import { sendAlertRouter } from "./routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/send-alert", sendAlertRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Start the bot
bot;
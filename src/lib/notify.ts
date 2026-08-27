import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/pricing";

type NotifyInput = {
  title: string;
  text: string;
};

export async function notifyStaff({ title, text }: NotifyInput) {
  const message = `${title}\n\n${text}`.slice(0, 3500);

  await prisma.syncLog.create({
    data: {
      type: "NOTIFY",
      direction: "SITE->STAFF",
      status: "QUEUED",
      message: message.slice(0, 500),
    },
  });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });
      await prisma.syncLog.create({
        data: {
          type: "NOTIFY",
          direction: "SITE->TELEGRAM",
          status: res.ok ? "OK" : "ERROR",
          message: res.ok ? title : await res.text(),
        },
      });
    } catch (e) {
      await prisma.syncLog.create({
        data: {
          type: "NOTIFY",
          direction: "SITE->TELEGRAM",
          status: "ERROR",
          message: e instanceof Error ? e.message : "telegram failed",
        },
      });
    }
  }

  const hook = process.env.NOTIFY_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text, to: SITE.email }),
      });
    } catch {
      /* optional channel */
    }
  }
}

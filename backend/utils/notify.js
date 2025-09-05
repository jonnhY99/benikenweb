// backend/utils/notify.js
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import Notification from '../models/Notification.js';
import PushSub from '../models/PushSub.js';

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM,
  VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
} = process.env;

// Email
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

// Web Push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${VAPID_SUBJECT || 'admin@beniken.com'}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function createAndEmit(io, { userId, title, body, type = 'system', orderId }) {
  const doc = await Notification.create({ userId, title, body, type, orderId });

  // 1) In-app (socket)
  io.to(String(userId)).emit('notify', {
    id: doc._id, title, body, type, orderId, createdAt: doc.createdAt,
  });

  // 2) Push del navegador (si hay suscripción)
  try {
    const subs = await PushSub.find({ userId });
    const payload = JSON.stringify({ title, body, orderId });

    await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys }, // <- sólo los campos que necesita web-push
          payload
        )
      )
    );
  } catch (e) {
    console.warn('No se pudo enviar push:', e?.message || e);
  }

  return doc;
}

export async function sendEmail(to, subject, html) {
  if (!SMTP_HOST) return; // opcional
  await transporter.sendMail({
    from: SMTP_FROM || '"Beniken" <no-reply@beniken>',
    to,
    subject,
    html,
  });
}

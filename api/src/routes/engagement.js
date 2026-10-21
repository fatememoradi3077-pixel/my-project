/** Newsletter sign-up and the contact form. */
import { Router } from 'express';
import { query } from '../db.js';
import { isEmail, h } from '../helpers.js';

const router = Router();

router.post(
  '/newsletter',
  h(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!isEmail(email)) {
      return res.status(400).json({ errors: { email: 'Enter a valid email address.' } });
    }
    const inserted = await query(
      `INSERT INTO newsletter_subscriptions (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [email],
    );
    res.status(inserted.rows.length ? 201 : 200).json({
      ok: true,
      alreadySubscribed: inserted.rows.length === 0,
      message: inserted.rows.length
        ? 'You are on the list — watch your inbox for the next drop.'
        : 'You are already subscribed with this email address.',
    });
  }),
);

router.post(
  '/contact',
  h(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const subject = String(req.body?.subject ?? '').trim();
    const message = String(req.body?.message ?? '').trim();

    const errors = {};
    if (name.length < 2) errors.name = 'Please enter your name.';
    if (!isEmail(email)) errors.email = 'Enter a valid email address.';
    if (message.length < 10) errors.message = 'Tell us a little more (10 characters or more).';
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    await query('INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)', [
      name,
      email,
      subject || 'General enquiry',
      message,
    ]);
    res.status(201).json({ ok: true, message: 'Thanks — our team replies within one business day.' });
  }),
);

export default router;

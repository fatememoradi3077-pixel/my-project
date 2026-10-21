import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Mail, MapPin, Phone } from 'lucide-react';
import { Button, EmptyState } from '../components/ui/primitives.jsx';
import { TextAreaField, TextField } from '../components/ui/FormField.jsx';
import { api } from '../lib/api.js';
import { BRAND } from '../lib/content.js';
import { useToast } from '../context/ToastContext.jsx';

export function Contact() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) nextErrors.message = 'Please add a little more detail.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.contact(form);
      setSent(true);
      toast.push({ tone: 'success', title: 'Message sent', message: result.message });
    } catch (error) {
      if (error.fieldErrors) setErrors(error.fieldErrors);
      toast.push({ tone: 'error', title: 'Could not send', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="th-container py-10">
      <Link to="/" className="th-link-more mb-6">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back home
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="th-eyebrow">Contact</p>
          <h1 className="mt-2 font-display text-[28px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
            Talk to TechHaven
          </h1>
          <p className="mt-2 max-w-lg text-sm text-ink-muted">
            Questions about an order, a product specification or a return? Send us a note and we reply within one
            business day.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                <Phone className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-ink">Phone support</span>
                <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`} className="text-ink-muted hover:text-brand">
                  {BRAND.phone}
                </a>
                <span className="block text-xs text-ink-faint">24/7, including public holidays</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                <Mail className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-ink">Email</span>
                <a href={`mailto:${BRAND.supportEmail}`} className="text-ink-muted hover:text-brand">
                  {BRAND.supportEmail}
                </a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-ink">Warehouse &amp; showroom</span>
                <span className="text-ink-muted">{BRAND.address}</span>
              </span>
            </li>
          </ul>

          <div className="th-card mt-8 p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">Before you write</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Order-specific answers are usually fastest in{' '}
              <Link to="/account?tab=orders" className="font-semibold text-brand hover:text-brand-hover">
                your order history
              </Link>
              , and our{' '}
              <Link to="/info/help-center" className="font-semibold text-brand hover:text-brand-hover">
                help centre
              </Link>{' '}
              covers shipping, returns and warranty.
            </p>
          </div>
        </div>

        <div className="th-card h-fit p-6">
          {sent ? (
            <EmptyState
              icon={Compass}
              title="Message received"
              message="Thanks — our team will reply to your email within one business day."
              action={
                <div className="mt-1 flex gap-2">
                  <Button size="sm" onClick={() => navigate('/shop')}>
                    Continue shopping
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSent(false)}>
                    Send another
                  </Button>
                </div>
              }
            />
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <h2 className="font-display text-base font-bold uppercase tracking-wide text-ink">Send a message</h2>
              <TextField
                label="Your name"
                required
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                autoComplete="name"
              />
              <TextField
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                autoComplete="email"
              />
              <TextField label="Subject" value={form.subject} onChange={set('subject')} placeholder="Order enquiry" />
              <TextAreaField
                label="Message"
                required
                rows={6}
                value={form.message}
                onChange={set('message')}
                error={errors.message}
                placeholder="How can we help?"
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Sending…' : 'SEND MESSAGE'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

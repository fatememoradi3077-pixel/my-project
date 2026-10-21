import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Lock, ShoppingBag, Truck } from 'lucide-react';
import { Badge, Button, EmptyState, ProductImage, Spinner } from '../components/ui/primitives.jsx';
import { SelectField, TextField } from '../components/ui/FormField.jsx';
import { api } from '../lib/api.js';
import { currency } from '../lib/format.js';
import { COUNTRIES, DELIVERY_METHODS } from '../lib/content.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const STEPS = [
  { key: 'contact', label: 'Contact details' },
  { key: 'shipping', label: 'Shipping address' },
  { key: 'delivery', label: 'Delivery method' },
  { key: 'review', label: 'Review & place order' },
];

const STORAGE_KEY = 'techhaven.checkout.v1';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Checkout() {
  const navigate = useNavigate();
  const cart = useCart();
  const toast = useToast();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [details, setDetails] = useState(() => {
    let saved = {};
    try {
      saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {};
    } catch {
      saved = {};
    }
    return {
      name: saved.name ?? '',
      email: saved.email ?? '',
      phone: saved.phone ?? '',
      line1: saved.line1 ?? '',
      line2: saved.line2 ?? '',
      city: saved.city ?? '',
      region: saved.region ?? '',
      postalCode: saved.postalCode ?? '',
      country: saved.country ?? 'United Kingdom',
      deliveryMethod: saved.deliveryMethod ?? 'standard',
    };
  });

  useEffect(() => {
    if (!user) return;
    setDetails((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
    }));
  }, [user]);

  const pricing = useMemo(() => {
    const subtotal = cart.subtotal;
    const method = DELIVERY_METHODS.find((item) => item.value === details.deliveryMethod) ?? DELIVERY_METHODS[0];
    const shipping = details.deliveryMethod === 'pickup' || subtotal >= 99 ? 0 : method.fee;
    return { subtotal, shipping, total: Math.round((subtotal + shipping) * 100) / 100, method };
  }, [cart.subtotal, details.deliveryMethod]);

  const set = (key) => (event) => {
    const value = event.target.value;
    setDetails((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateStep = (index) => {
    const next = {};
    if (index === 0) {
      if (details.name.trim().length < 2) next.name = 'Enter the name for this order.';
      if (!EMAIL_PATTERN.test(details.email.trim())) next.email = 'Enter a valid email address.';
      if (details.phone.trim().length < 6) next.phone = 'Enter a contact phone number.';
    }
    if (index === 1 && details.deliveryMethod !== 'pickup') {
      if (details.line1.trim().length < 4) next.line1 = 'Enter your street address.';
      if (details.city.trim().length < 2) next.city = 'Enter your city.';
      if (details.postalCode.trim().length < 3) next.postalCode = 'Enter your postcode.';
      if (!details.country) next.country = 'Choose a country.';
    }
    return next;
  };

  const goNext = () => {
    const found = validateStep(step);
    if (Object.keys(found).length) {
      setErrors(found);
      toast.push({ tone: 'error', title: 'Check the highlighted fields', message: 'A few details are missing.' });
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const placeOrder = async () => {
    const firstErrors = { ...validateStep(0), ...validateStep(1) };
    if (Object.keys(firstErrors).length) {
      setErrors(firstErrors);
      setStep(Object.keys(validateStep(0)).length ? 0 : 1);
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.orders.create({
        items: cart.items.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        contact: { name: details.name, email: details.email, phone: details.phone },
        shippingAddress: {
          line1: details.line1,
          line2: details.line2,
          city: details.city,
          region: details.region,
          postalCode: details.postalCode,
          country: details.country,
        },
        deliveryMethod: details.deliveryMethod,
      });
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            name: details.name,
            email: details.email,
            phone: details.phone,
            line1: details.line1,
            line2: details.line2,
            city: details.city,
            region: details.region,
            postalCode: details.postalCode,
            country: details.country,
            deliveryMethod: details.deliveryMethod,
          }),
        );
      } catch {
        /* storage unavailable */
      }
      cart.clear();
      navigate(`/order/${order.reference}`, { state: { order }, replace: true });
    } catch (error) {
      if (error.fieldErrors) {
        setErrors(error.fieldErrors);
        const contactKeys = ['name', 'email', 'phone'];
        setStep(Object.keys(error.fieldErrors).some((key) => contactKeys.includes(key)) ? 0 : 1);
      }
      toast.push({ tone: 'error', title: 'Order not placed', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="th-container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add a product to your cart before checking out."
          action={
            <Link to="/shop" className="th-btn th-btn-primary th-btn-md mt-1">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="th-container py-8">
      <h1 className="font-display text-[26px] font-extrabold uppercase tracking-tight text-ink sm:text-[30px]">
        Checkout
      </h1>

      <ol className="mt-5 flex flex-wrap gap-2">
        {STEPS.map((item, index) => {
          const state = index === step ? 'current' : index < step ? 'done' : 'todo';
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => index < step && setStep(index)}
                disabled={index > step}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  state === 'current'
                    ? 'border-brand bg-brand/10 text-brand'
                    : state === 'done'
                      ? 'border-line bg-surface-panel text-ink hover:border-brand'
                      : 'border-line-soft bg-surface-panel text-ink-faint'
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-raised text-[11px]">
                  {state === 'done' ? <Check className="h-3 w-3" aria-hidden="true" /> : index + 1}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="th-card p-5 sm:p-6">
          {step === 0 ? (
            <section aria-labelledby="step-contact" className="space-y-4">
              <h2 id="step-contact" className="font-display text-base font-bold uppercase tracking-wide text-ink">
                Contact details
              </h2>
              <TextField label="Full name" required value={details.name} onChange={set('name')} error={errors.name} autoComplete="name" />
              <TextField
                label="Email"
                type="email"
                required
                value={details.email}
                onChange={set('email')}
                error={errors.email}
                hint="Order confirmation and tracking go to this address."
                autoComplete="email"
              />
              <TextField
                label="Phone"
                required
                value={details.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
              />
            </section>
          ) : null}

          {step === 1 ? (
            <section aria-labelledby="step-shipping" className="space-y-4">
              <h2 id="step-shipping" className="font-display text-base font-bold uppercase tracking-wide text-ink">
                Shipping address
              </h2>
              {details.deliveryMethod === 'pickup' ? (
                <p className="rounded-md border border-line bg-surface-panel px-3.5 py-3 text-sm text-ink-muted">
                  Collecting in store — an address is not required. Bring photo ID and your order reference.
                </p>
              ) : null}
              <TextField
                label="Street address"
                required={details.deliveryMethod !== 'pickup'}
                value={details.line1}
                onChange={set('line1')}
                error={errors.line1}
                autoComplete="address-line1"
              />
              <TextField
                label="Apartment, suite (optional)"
                value={details.line2}
                onChange={set('line2')}
                autoComplete="address-line2"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="City" required value={details.city} onChange={set('city')} error={errors.city} />
                <TextField label="County / region (optional)" value={details.region} onChange={set('region')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Postcode"
                  required
                  value={details.postalCode}
                  onChange={set('postalCode')}
                  error={errors.postalCode}
                  autoComplete="postal-code"
                />
                <SelectField
                  label="Country"
                  required
                  value={details.country}
                  onChange={set('country')}
                  error={errors.country}
                  options={COUNTRIES.map((country) => ({ value: country, label: country }))}
                />
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section aria-labelledby="step-delivery" className="space-y-3">
              <h2 id="step-delivery" className="font-display text-base font-bold uppercase tracking-wide text-ink">
                Delivery method
              </h2>
              {DELIVERY_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-md border p-4 transition-colors ${
                    details.deliveryMethod === method.value
                      ? 'border-brand bg-brand/5'
                      : 'border-line bg-surface-panel hover:border-ink-faint'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value={method.value}
                      checked={details.deliveryMethod === method.value}
                      onChange={set('deliveryMethod')}
                      className="h-4 w-4 accent-brand"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{method.label}</span>
                      <span className="block text-xs text-ink-muted">{method.detail}</span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {pricing.subtotal >= 99 && method.value !== 'pickup' ? 'Free' : currency(method.fee)}
                  </span>
                </label>
              ))}
              <p className="flex items-center gap-2 text-xs text-ink-faint">
                <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Free standard shipping applies to orders over
                $99.
              </p>
            </section>
          ) : null}

          {step === 3 ? (
            <section aria-labelledby="step-review" className="space-y-4">
              <h2 id="step-review" className="font-display text-base font-bold uppercase tracking-wide text-ink">
                Review &amp; place order
              </h2>

              <div className="rounded-md border border-brand/35 bg-brand/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand">
                  <Lock className="h-4 w-4" aria-hidden="true" /> Demo checkout
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  No payment provider is connected to this deployment, so no payment is taken and no card details are
                  collected or stored. Placing the order records it in your account so you can review the full flow.
                </p>
              </div>

              <dl className="divide-y divide-line-soft text-sm">
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-ink-faint">Contact</dt>
                  <dd className="text-right text-ink">
                    {details.name}
                    <br />
                    <span className="text-ink-muted">{details.email}</span>
                    <br />
                    <span className="text-ink-muted">{details.phone}</span>
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-ink-faint">Deliver to</dt>
                  <dd className="text-right text-ink">
                    {details.deliveryMethod === 'pickup' ? (
                      'Collection in store, Bristol'
                    ) : (
                      <>
                        {details.line1}
                        {details.line2 ? `, ${details.line2}` : ''}
                        <br />
                        {details.city}
                        {details.region ? `, ${details.region}` : ''} {details.postalCode}
                        <br />
                        {details.country}
                      </>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-ink-faint">Delivery</dt>
                  <dd className="text-right text-ink">{pricing.method.label}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-[13px] font-semibold text-brand hover:text-brand-hover"
              >
                Edit contact details
              </button>
            </section>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line-soft pt-5">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              disabled={step === 0}
              className="th-btn th-btn-ghost th-btn-md disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <Button onClick={goNext}>Continue</Button>
            ) : (
              <Button onClick={placeOrder} disabled={submitting} size="lg">
                {submitting ? <Spinner className="h-4 w-4" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
                {submitting ? 'Placing order…' : 'PLACE DEMO ORDER'}
              </Button>
            )}
          </div>
        </div>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="th-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {cart.items.map((line) => (
                <li key={line.product.id} className="flex items-center gap-3">
                  <ProductImage
                    src={line.product.image}
                    alt={line.product.name}
                    className="h-12 w-12 shrink-0 rounded bg-surface-panel"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{line.product.name}</span>
                    <span className="block text-xs text-ink-muted">Qty {line.quantity}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-ink">
                    {currency(line.product.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-line-soft pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="text-ink">{currency(pricing.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Shipping</dt>
                <dd className={pricing.shipping === 0 ? 'text-success' : 'text-ink'}>
                  {pricing.shipping === 0 ? 'Free' : currency(pricing.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line-soft pt-3">
                <dt className="font-display text-base font-bold text-ink">Total</dt>
                <dd className="font-display text-lg font-extrabold text-brand">{currency(pricing.total)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center gap-2">
              <Badge tone="muted">Demo mode</Badge>
              <p className="text-[11px] text-ink-faint">No payment is processed on this deployment.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

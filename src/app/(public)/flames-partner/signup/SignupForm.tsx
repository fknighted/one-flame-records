'use client';

import { useState, useTransition, useRef, useId } from 'react';
import { TIERS } from '@/lib/partner/rules';
import type { TierKey } from '@/lib/partner/rules';
import { submitSignup } from '@/lib/partner/public-actions';

type MemberData = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  employer: string;
  payment_day: string;
};

type GuarantorData = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  employer: string;
  relationship_to_member: string;
};

const DAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

const emptyMember: MemberData = {
  full_name: '', email: '', phone: '', address: '', employer: '', payment_day: '1',
};

const emptyGuarantor: GuarantorData = {
  full_name: '', email: '', phone: '', address: '', employer: '', relationship_to_member: '',
};

function Field({
  label, name, type = 'text', value, onChange, required = true, as,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  as?: 'textarea';
}) {
  const fieldId=useId();
  const base = 'mt-1 block w-full  border border-line px-3 py-2 text-sm  focus:border-line focus:outline-none focus:ring-1 focus:ring-orange-500';
  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-paper">{label}</label>
      {as === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={base}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-line text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-paper font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function jmd(n: number) {
  return `J$${n.toLocaleString()}`;
}

export default function SignupForm({ tier }: { tier: TierKey }) {
  const requestId=useRef<string | null>(null);
  const tierConfig = TIERS[tier];
  const [step, setStep] = useState(1);
  const [member, setMember] = useState<MemberData>(emptyMember);
  const [guarantor, setGuarantor] = useState<GuarantorData>(emptyGuarantor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function setM(key: keyof MemberData) {
    return (v: string) => setMember((m) => ({ ...m, [key]: v }));
  }
  function setG(key: keyof GuarantorData) {
    return (v: string) => setGuarantor((g) => ({ ...g, [key]: v }));
  }

  function advanceToStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStep(2);
  }

  function advanceToStep3(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStep(3);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitSignup(member, guarantor, tier, requestId.current ??= crypto.randomUUID());
      if (result?.error) setError(result.error);
    });
  }

  const dayLabel = DAYS.find((d) => d.value === member.payment_day)?.label ?? '';

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tier banner */}
      <div className="mb-6  bg-raised border border-line px-4 py-3 text-sm">
        <span className="font-semibold text-yellow">{tierConfig.displayName} tier — </span>
        <span className="text-yellow">
          {jmd(tierConfig.weeklyContribution)}/week · Draw {jmd(tierConfig.drawAmount)} · Deposit {jmd(tierConfig.deposit)}
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Your info', 'Guarantor info', 'Review'].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7  flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step > i + 1 || step === i + 1
                  ? 'bg-yellow text-black'
                  : 'bg-line text-muted'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${step === i + 1 ? 'text-paper font-medium' : 'text-muted'}`}>
              {label}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-line" />}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4  bg-raised px-4 py-3 text-sm text-yellow">{error}</p>
      )}

      {/* Step 1 — Member info */}
      {step === 1 && (
        <form onSubmit={advanceToStep2} className="space-y-4">
          <h2 className="text-lg font-semibold text-paper">Your information</h2>
          <Field label="Full name" name="full_name" value={member.full_name} onChange={setM('full_name')} />
          <Field label="Email address" name="email" type="email" value={member.email} onChange={setM('email')} />
          <Field label="Phone number" name="phone" type="tel" value={member.phone} onChange={setM('phone')} />
          <Field label="Home address" name="address" value={member.address} onChange={setM('address')} as="textarea" />
          <Field label="Employer" name="employer" value={member.employer} onChange={setM('employer')} />
          <div>
            <label htmlFor="partner-payment-day" className="block text-sm font-medium text-paper">Preferred payment day</label>
            <select
              id="partner-payment-day" name="payment_day"
              value={member.payment_day}
              onChange={(e) => setM('payment_day')(e.target.value)}
              required
              className="mt-1 block w-full  border border-line px-3 py-2 text-sm  focus:border-line focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full  bg-yellow px-4 py-2 text-sm font-semibold text-black hover:bg-yellow"
          >
            Continue
          </button>
        </form>
      )}

      {/* Step 2 — Guarantor info */}
      {step === 2 && (
        <form onSubmit={advanceToStep3} className="space-y-4">
          <h2 className="text-lg font-semibold text-paper">Guarantor information</h2>
          <p className="text-sm text-muted">
            Your guarantor takes on liability of up to {jmd(tierConfig.guarantorMaxLiability)} if you default after receiving your draw. They must agree via email.
          </p>
          <Field label="Guarantor full name" name="full_name" value={guarantor.full_name} onChange={setG('full_name')} />
          <Field label="Guarantor email" name="email" type="email" value={guarantor.email} onChange={setG('email')} />
          <Field label="Guarantor phone" name="phone" type="tel" value={guarantor.phone} onChange={setG('phone')} />
          <Field label="Guarantor home address" name="address" value={guarantor.address} onChange={setG('address')} as="textarea" />
          <Field label="Guarantor employer" name="employer" value={guarantor.employer} onChange={setG('employer')} />
          <Field label="Relationship to you" name="relationship_to_member" value={guarantor.relationship_to_member} onChange={setG('relationship_to_member')} />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1  border border-line px-4 py-2 text-sm font-semibold text-paper hover:bg-black"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1  bg-yellow px-4 py-2 text-sm font-semibold text-black hover:bg-yellow"
            >
              Continue
            </button>
          </div>
        </form>
      )}

      {/* Step 3 — Review */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-paper">Review your application</h2>

          <div>
            <h3 className="text-sm font-semibold text-paper mb-2">Your information</h3>
            <ReviewRow label="Name" value={member.full_name} />
            <ReviewRow label="Email" value={member.email} />
            <ReviewRow label="Phone" value={member.phone} />
            <ReviewRow label="Address" value={member.address} />
            <ReviewRow label="Employer" value={member.employer} />
            <ReviewRow label="Payment day" value={dayLabel} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-paper mb-2">Guarantor information</h3>
            <ReviewRow label="Name" value={guarantor.full_name} />
            <ReviewRow label="Email" value={guarantor.email} />
            <ReviewRow label="Phone" value={guarantor.phone} />
            <ReviewRow label="Address" value={guarantor.address} />
            <ReviewRow label="Employer" value={guarantor.employer} />
            <ReviewRow label="Relationship" value={guarantor.relationship_to_member} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-paper mb-2">Program terms</h3>
            <ReviewRow label="Tier" value={tierConfig.displayName} />
            <ReviewRow label="Weekly contribution" value={jmd(tierConfig.weeklyContribution)} />
            <ReviewRow label="Deposit (refundable)" value={jmd(tierConfig.deposit)} />
            <ReviewRow label="Draw amount" value={jmd(tierConfig.drawAmount)} />
            <ReviewRow label="Guarantor max liability" value={jmd(tierConfig.guarantorMaxLiability)} />
          </div>

          <p className="text-xs text-muted">
            By submitting, you confirm that the information above is accurate and you agree to the program terms.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1  border border-line px-4 py-2 text-sm font-semibold text-paper hover:bg-black"
              disabled={isPending}
            >
              Back
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isPending}
              className="flex-1  bg-yellow px-4 py-2 text-sm font-semibold text-black hover:bg-yellow disabled:opacity-60"
            >
              {isPending ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

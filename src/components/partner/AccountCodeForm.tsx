'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PasswordForm from '@/components/PasswordForm';

export default function AccountCodeForm({purpose}:{purpose:'setup'|'reset'}) {
  const [ready,setReady]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState('');
  async function verify(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending)return;setPending(true);setError('');
    const form=new FormData(event.currentTarget);
    try{
      const {data,error}=await createClient().auth.verifyOtp({email:String(form.get('email')).trim().toLowerCase(),token:String(form.get('code')).trim(),type:purpose==='reset'?'recovery':'email'});
      if(error||!data.session){setError('That code is invalid or expired. Request a new code and try again.');return;}
      setReady(true);
    }catch{setError('Verification could not connect. Please try again.');}
    finally{setPending(false);}
  }
  if(ready)return <PasswordForm partnerBranding />;
  return <section className="mx-auto max-w-md space-y-5 px-4 py-12">
    <h1 className="font-poster text-3xl uppercase text-yellow">{purpose==='reset'?'Reset your password':'Set up your account'}</h1>
    <p>Enter your email and the eight-digit code from your Flames Partner email.</p>
    <form onSubmit={verify} className="space-y-4">
      <label className="studio-field-label" htmlFor="account-email">Email</label><input className="studio-field" id="account-email" name="email" type="email" autoComplete="email" required />
      <label className="studio-field-label" htmlFor="account-code">Email code</label><input className="studio-field" id="account-code" name="code" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} autoComplete="one-time-code" required />
      {error&&<p role="alert" className="studio-error">{error}</p>}
      <button disabled={pending} className="studio-btn studio-btn-primary">{pending?'Checking…':'Continue'}</button>
    </form>
  </section>;
}

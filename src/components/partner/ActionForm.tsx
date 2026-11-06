'use client';
import { useActionState } from 'react';
import { useRetryableAction } from '@/lib/retryable-action';
import type { PartnerActionState } from '@/lib/partner/admin-actions';

export default function ActionForm({action,children,className}:{action:(state:PartnerActionState,data:FormData)=>Promise<PartnerActionState>;children:React.ReactNode;className?:string}) {
  const retry=useRetryableAction(action);
  const [state,submit,pending]=useActionState(retry,null);
  return <form action={submit} className={className}>
    <fieldset disabled={pending} className="min-w-0 space-y-3 disabled:opacity-60">{children}</fieldset>
    {pending&&<p role="status" className="text-sm text-muted">Saving…</p>}
    {state?.error&&<p role="alert" className="studio-error mt-2">{state.error}</p>}
    {state?.success&&<p role="status" className="text-sm text-paper mt-2">{state.success}</p>}
  </form>;
}

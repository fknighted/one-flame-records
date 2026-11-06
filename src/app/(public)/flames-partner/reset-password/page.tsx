import AccountCodeForm from '@/components/partner/AccountCodeForm';
export const metadata={robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default function ResetPasswordPage(){return <AccountCodeForm purpose="reset" />;}

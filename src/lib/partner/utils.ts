import { APP_TIMEZONE } from './rules';

export function formatJMD(amount: number): string {
  return `J$${amount.toLocaleString('en-JM', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(date: string | Date): string {
  const value=typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)?date+'T12:00:00Z':date;
  return new Date(value).toLocaleDateString('en-JM', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function jamaicaDay(value:Date):number {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:APP_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(value);
  const part=(kind:string)=>Number(parts.find(p=>p.type===kind)?.value);
  return Date.UTC(part('year'),part('month')-1,part('day'))/86400000;
}
export function daysUntil(date:string|Date,now=new Date()):number {
  const target=typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)?Date.parse(date+'T00:00:00Z')/86400000:jamaicaDay(new Date(date));
  return target-jamaicaDay(now);
}

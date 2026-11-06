import { requirePartnerAdmin } from '@/lib/partner/auth';
import { createAdminClient } from '@/lib/partner/database';
import { formatDate } from '@/lib/partner/utils';

export default async function AuditLogPage() {
  await requirePartnerAdmin();
  const adminClient = createAdminClient();

  const { data: logs } = await adminClient
    .from('partner_audit_log')
    .select('id, action, actor_id, target_type, target_id, details, created_at, profiles(id)').throwOnError()
    .order('created_at', { ascending: false })
    .limit(200);

  // Fetch actor emails separately
  const actorIds = [...new Set((logs ?? []).map(l => l.actor_id).filter(Boolean))];
  const { data: { users } } = actorIds.length > 0
    ? await adminClient.auth.admin.listUsers()
    : { data: { users: [] } };

  const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u.email ?? u.id]));

  return (
    <div className="space-y-6">
      <h2 className="font-poster text-3xl uppercase text-paper">Audit Log</h2>

      <div className="bg-panel border overflow-x-auto">
        {logs && logs.length > 0 ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-black border-b">
              <tr>
                {['Time', 'Action', 'Actor', 'Target', 'Details'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.map((log) => (
                <tr key={log.id} className="align-top">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-paper">{log.action}</td>
                  <td className="px-4 py-3 text-muted text-xs">{log.actor_id ? (userMap[log.actor_id] ?? log.actor_id.slice(0, 8)) : '—'}</td>
                  <td className="px-4 py-3 text-muted text-xs">
                    <span className="capitalize">{log.target_type}</span>
                    {log.target_id && <span className="block font-mono opacity-50">{log.target_id.slice(0, 8)}…</span>}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs font-mono">
                    {log.details ? JSON.stringify(log.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">No audit events yet.</p>
        )}
      </div>
    </div>
  );
}

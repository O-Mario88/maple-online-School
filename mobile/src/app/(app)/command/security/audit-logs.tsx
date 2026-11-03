import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { AuditDesk, AuditPhone } from '@/features/command/views/AuditViews';

/** Maple Command › Security › Enterprise Audit Logs (`/(command)/security/audit-logs`). */
export default function AuditLogsScreen() {
  return <CommandRoute desk={AuditDesk} phone={AuditPhone} title="Audit Logs" subtitle="Immutable record of privileged actions and data access" />;
}

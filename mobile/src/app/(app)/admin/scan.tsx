import { ScannerScreen } from '@/features/school/admin/Scanner';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

export default function ScanScreen() {
  return <AdminRoute desk={ScannerScreen} phone={ScannerScreen} title="QR Scanner" subtitle="Gate entry, gate exit and lesson check" />;
}

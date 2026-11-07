import { RecognitionDesk, RecognitionPhone } from '@/features/command/finance/RecognitionViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Revenue Recognition & Deferred Revenue (`/(command)/finance/revenue-recognition`). */
export default function RevenueRecognitionScreen() {
  return <CommandRoute desk={RecognitionDesk} phone={RecognitionPhone} title="Revenue Recognition" subtitle="Cash received versus revenue earned" />;
}

import { Banner, Button, Card, ToggleRow } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { router } from 'expo-router';
import { toast } from '@/lib/toast';

/** Inventory 5: a parent approves what a child under 13 can do before the account opens. */
export default function ConsentScreen() {
  return (
    <PreviewScreen publicNav title="Your consent" subtitle="Your child's account opens once you agree" width="narrow">
      {(m) => {
        const c = m.publicPages.consent;
        return (
          <>
            <Banner tone="info" title={`${c.child} (${c.age}) wants to join Maple`} body={`Through ${c.school}. Children under 13 need a parent's say-so.`} />
            <Card title="What you allow" subtitle="Change any of these later in Settings" icon="hand">
              {c.asks.map((a) => (
                <ToggleRow key={a.label} label={a.label} initial={a.on} />
              ))}
            </Card>
            <Button label="I agree, open the account" icon="check" onPress={() => { toast('Thank you. The account is open, so your child can sign in now.'); router.replace('/sign-in'); }} />
            <Button label="Not now" variant="ghost" compact onPress={() => router.replace('/welcome')} />
          </>
        );
      }}
    </PreviewScreen>
  );
}

import { useState } from 'react';

import { Banner, Button, Card, Chip, ChipRow, Field, KeyValue } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { formatMoney } from '@/lib/finance/fees';
import { router } from 'expo-router';
import { SAMPLE_CHECKOUT } from '@/lib/navigation';

/** Inventory 17: one checkout for courses, lessons and events, with mobile money first. */
export default function CheckoutScreen() {
  const [method, setMethod] = useState('MTN MoMo');
  const [useWallet, setUseWallet] = useState(true);
  return (
    <PreviewScreen back title="Checkout" width="narrow">
      {(m) => {
        const c = m.shared.checkout;
        const fromWallet = useWallet ? Math.min(c.walletUGX, c.priceUGX) : 0;
        const due = c.priceUGX - fromWallet;
        return (
          <>
            <Card title={c.item} subtitle={c.seller} icon="star">
              <KeyValue
                items={[
                  { label: 'Price', value: formatMoney(c.priceUGX, 'UGX') },
                  { label: 'From your wallet', value: fromWallet ? `− ${formatMoney(fromWallet, 'UGX')}` : '—' },
                  { label: 'To pay now', value: formatMoney(due, 'UGX') },
                ]}
              />
              <Chip label={`Use wallet balance (${formatMoney(c.walletUGX, 'UGX')})`} selected={useWallet} onPress={() => setUseWallet((w) => !w)} />
            </Card>
            <Card title="Pay with" icon="wallet">
              <ChipRow>
                {c.methods
                  .filter((x) => x !== 'Maple wallet')
                  .map((x) => (
                    <Chip key={x} label={x} selected={method === x} onPress={() => setMethod(x)} />
                  ))}
              </ChipRow>
              {method === 'Card' ? null : <Field label="Phone number" placeholder="07XX XXX XXX" keyboardType="phone-pad" />}
              <Button label={`Pay ${formatMoney(due, 'UGX')}`} icon="lock" onPress={() => router.push(SAMPLE_CHECKOUT)} />
            </Card>
            <Banner tone="good" title="Protected payment" body={c.guarantee} />
          </>
        );
      }}
    </PreviewScreen>
  );
}

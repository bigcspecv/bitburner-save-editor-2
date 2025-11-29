import { SectionStub } from './SectionStub';

export function StockMarketSection() {
  return (
    <SectionStub
      title="Stock Market"
      summary="Stock market access flags and open orders."
      items={[
        'Orders viewer/editor',
        'Access flags',
        'Money tracking',
      ]}
    />
  );
}


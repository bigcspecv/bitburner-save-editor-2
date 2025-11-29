import { SectionStub } from './SectionStub';

export function PlayerSection() {
  return (
    <SectionStub
      title="Player"
      summary="Character identity, stats, money, karma, and entropy."
      items={[
        'Stats & skills editor',
        'Money / karma / entropy controls',
        'Multipliers (read-only)',
      ]}
    />
  );
}


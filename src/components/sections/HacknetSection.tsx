import { SectionStub } from './SectionStub';

export function HacknetSection() {
  return (
    <SectionStub
      title="Hacknet"
      summary="Hacknet nodes and hash manager controls."
      items={[
        'Hacknet nodes (add/edit/remove)',
        'Hash manager & upgrades',
      ]}
    />
  );
}


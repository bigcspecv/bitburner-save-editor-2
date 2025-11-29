import { SectionStub } from './SectionStub';

export function ServersSection() {
  return (
    <SectionStub
      title="Servers"
      summary="Network view for all servers plus player-owned purchased servers."
      items={[
        'All servers grid',
        'Purchased servers manager',
        'Server details (RAM, money, flags)',
        'Current terminal server',
      ]}
    />
  );
}


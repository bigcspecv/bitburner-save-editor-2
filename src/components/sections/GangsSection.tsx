import { SectionStub } from './SectionStub';

export function GangsSection() {
  return (
    <SectionStub
      title="Gangs"
      summary="Gang management tools once the player has a gang."
      items={[
        'Gang stats',
        'Members (add/edit/remove)',
        'Territory & power',
      ]}
    />
  );
}


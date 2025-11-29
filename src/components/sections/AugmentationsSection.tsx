import { SectionStub } from './SectionStub';

export function AugmentationsSection() {
  return (
    <SectionStub
      title="Augmentations"
      summary="Installed and queued augmentations, including NeuroFlux handling."
      items={[
        'Installed augmentations',
        'Queued augmentations',
        'NeuroFlux Governor levels',
        'Filter by effect type',
      ]}
    />
  );
}


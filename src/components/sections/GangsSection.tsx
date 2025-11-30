import { Card, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function GangsSection() {
  const gangData = useSaveStore((state) => state.currentSave?.AllGangsSave);
  const playerGang = useSaveStore((state) => state.currentSave?.PlayerSave.data.gang);

  if (!gangData || !playerGang) {
    return (
      <Card title="Gangs" subtitle="Load a save file with gang data to edit">
        <p className="text-terminal-dim text-sm">
          No gang data loaded. Either no save file is loaded, or the player has not joined a gang yet.
        </p>
      </Card>
    );
  }

  const tabs = [
    {
      id: 'management',
      label: 'Management',
      content: (
        <div className="text-terminal-dim text-sm p-4 border border-terminal-primary/30">
          <p className="text-terminal-secondary uppercase mb-2">&gt; NOT IMPLEMENTED</p>
          <p>Gang management features will be added here.</p>
        </div>
      ),
    },
    {
      id: 'equipment',
      label: 'Equipment',
      content: (
        <div className="text-terminal-dim text-sm p-4 border border-terminal-primary/30">
          <p className="text-terminal-secondary uppercase mb-2">&gt; NOT IMPLEMENTED</p>
          <p>Gang equipment features will be added here.</p>
        </div>
      ),
    },
    {
      id: 'territory',
      label: 'Territory',
      content: (
        <div className="text-terminal-dim text-sm p-4 border border-terminal-primary/30">
          <p className="text-terminal-secondary uppercase mb-2">&gt; NOT IMPLEMENTED</p>
          <p>Territory warfare features will be added here.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        title="Gangs"
        subtitle={`Managing gang: ${playerGang.facName ?? 'Unknown'}`}
      >
        <Tabs tabs={tabs} defaultTab="management" />
      </Card>
    </div>
  );
}


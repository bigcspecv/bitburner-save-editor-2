import { Card } from '../ui';

interface SectionStubProps {
  title: string;
  summary: string;
  items?: string[];
}

/**
 * Reusable placeholder panel for stubbed editor sections.
 * Replace with real content once save data wiring is in place.
 */
export function SectionStub({ title, summary, items }: SectionStubProps) {
  return (
    <Card
      title={title}
      subtitle="Navigation stub — editor UI coming soon"
    >
      <p className="text-terminal-dim">{summary}</p>
      {items && items.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-terminal-dim text-xs mt-4">
        Hook into the save store and replace this stub when implementing the editor UI.
      </p>
    </Card>
  );
}


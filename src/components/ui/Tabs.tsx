import { ReactNode, useState } from 'react';
import clsx from 'clsx';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

/**
 * Terminal-styled tabs component for navigation between content panels
 */
export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex border-b border-terminal-primary mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 font-mono uppercase tracking-wide text-sm',
              'border-b-2 transition-colors whitespace-nowrap',
              {
                'border-terminal-primary text-terminal-primary bg-terminal-dim/10':
                  activeTab === tab.id,
                'border-transparent text-terminal-dim hover:text-terminal-secondary':
                  activeTab !== tab.id,
              }
            )}
          >
            &gt; {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="font-mono text-terminal-primary">
        {currentTab?.content}
      </div>
    </div>
  );
}

// Controlled variant where parent manages active tab
export interface ControlledTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function ControlledTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: ControlledTabsProps) {
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex border-b border-terminal-primary mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'px-4 py-2 font-mono uppercase tracking-wide text-sm',
              'border-b-2 transition-colors whitespace-nowrap',
              {
                'border-terminal-primary text-terminal-primary bg-terminal-dim/10':
                  activeTab === tab.id,
                'border-transparent text-terminal-dim hover:text-terminal-secondary':
                  activeTab !== tab.id,
              }
            )}
          >
            &gt; {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="font-mono text-terminal-primary">
        {currentTab?.content}
      </div>
    </div>
  );
}

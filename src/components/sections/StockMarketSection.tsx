import { Card, Tabs } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function StockMarketSection() {
  const playerData = useSaveStore((state) => state.currentSave?.PlayerSave.data);
  const stockMarketSave = useSaveStore((state) => state.currentSave?.StockMarketSave);

  if (!playerData) {
    return (
      <Card title="Stock Market" subtitle="Load a save file to view stock market data">
        <p className="text-terminal-dim text-sm">
          No save file loaded. Upload a save file to view stock market access and positions.
        </p>
      </Card>
    );
  }

  const hasWseAccount = playerData.hasWseAccount;
  const hasTixApi = playerData.hasTixApiAccess;
  const has4SData = playerData.has4SData;
  const has4STixApi = playerData.has4SDataTixApi;

  const tabs = [
    {
      id: 'access',
      label: 'Access & Settings',
      content: (
        <Card title="Access & Settings" subtitle="Navigation stub — editor UI coming soon">
          <p className="text-terminal-dim">Edit stock market access flags and API permissions.</p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>WSE Account access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>TIX API access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>4S Market Data access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>4S Market Data TIX API access</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'positions',
      label: 'Positions',
      content: (
        <Card title="Stock Positions" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {stockMarketSave
              ? 'Stock position data exists but requires schema implementation to edit.'
              : 'No stock market data in save file.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Each stock has player shares (long/short), average prices, and market data.
            Full editing support requires implementing detailed Stock schemas.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Long positions (shares owned, avg price)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Short positions (shares shorted, avg price)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Stock prices and forecasts</span>
            </li>
          </ul>
        </Card>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      content: (
        <Card title="Open Orders" subtitle="Navigation stub — schema implementation required">
          <p className="text-terminal-dim">
            {stockMarketSave
              ? 'Order data may exist but requires schema implementation to edit.'
              : 'No stock market data in save file.'}
          </p>
          <p className="mt-2 text-black text-sm italic">
            Orders include limit orders and stop orders for buying/selling stocks.
            Full editing support requires implementing Order schemas.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-terminal-secondary">
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Limit buy/sell orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Stop buy/sell orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terminal-primary">•</span>
              <span>Order price and share counts</span>
            </li>
          </ul>
        </Card>
      ),
    },
  ];

  return (
    <Card
      title="Stock Market"
      subtitle={hasWseAccount ? 'WSE Account Active' : 'No WSE Account'}
    >
      <div className="space-y-6">
        {/* Stock Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* WSE Account */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; WSE Account
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Status:</span>
                <span className={hasWseAccount ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasWseAccount ? 'Active' : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* TIX API */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; TIX API
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Access:</span>
                <span className={hasTixApi ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {hasTixApi ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* 4S Data */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; 4S Market Data
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Access:</span>
                <span className={has4SData ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {has4SData ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* 4S TIX API */}
          <div className="space-y-4">
            <h3 className="text-terminal-secondary text-sm uppercase tracking-wide border-b border-terminal-dim pb-1">
              &gt; 4S TIX API
            </h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-terminal-dim">Access:</span>
                <span className={has4STixApi ? 'text-terminal-primary' : 'text-terminal-dim'}>
                  {has4STixApi ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for detailed sections */}
        <Tabs tabs={tabs} defaultTab="access" />
      </div>
    </Card>
  );
}

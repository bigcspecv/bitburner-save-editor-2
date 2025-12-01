import { Card, Checkbox, Tabs, ResetAction } from '../ui';
import { useSaveStore } from '../../store/save-store';

export function StockMarketSection() {
  const playerData = useSaveStore((state) => state.currentSave?.PlayerSave.data);
  const stockMarketSave = useSaveStore((state) => state.currentSave?.StockMarketSave);
  const updateStockMarketAccess = useSaveStore((state) => state.updateStockMarketAccess);
  const resetStockMarket = useSaveStore((state) => state.resetStockMarket);
  const hasStockMarketChanges = useSaveStore((state) => state.hasStockMarketChanges);

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
        <Card
          title="Access & Settings"
          subtitle="Edit stock market access flags and API permissions"
          actions={
            <ResetAction
              title="Reset Access"
              hasChanges={hasStockMarketChanges()}
              onReset={resetStockMarket}
            />
          }
        >
          <div className="space-y-6">
            {/* Access Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WSE Account */}
              <div className="space-y-3 p-4 border border-terminal-dim">
                <h4 className="text-terminal-secondary text-sm uppercase tracking-wide">
                  &gt; WSE Account
                </h4>
                <p className="text-terminal-dim text-xs">
                  Wall Street Exchange account access. Required to trade stocks.
                </p>
                <Checkbox
                  label="Has WSE Account"
                  checked={hasWseAccount}
                  onChange={(e) => updateStockMarketAccess({ hasWseAccount: e.target.checked })}
                />
              </div>

              {/* TIX API */}
              <div className="space-y-3 p-4 border border-terminal-dim">
                <h4 className="text-terminal-secondary text-sm uppercase tracking-wide">
                  &gt; TIX API Access
                </h4>
                <p className="text-terminal-dim text-xs">
                  Trade Information eXchange API. Enables programmatic stock trading.
                </p>
                <Checkbox
                  label="Has TIX API Access"
                  checked={hasTixApi}
                  onChange={(e) => updateStockMarketAccess({ hasTixApiAccess: e.target.checked })}
                />
              </div>

              {/* 4S Market Data */}
              <div className="space-y-3 p-4 border border-terminal-dim">
                <h4 className="text-terminal-secondary text-sm uppercase tracking-wide">
                  &gt; 4S Market Data
                </h4>
                <p className="text-terminal-dim text-xs">
                  Four Sigma market data subscription. Shows stock forecasts and volatility.
                </p>
                <Checkbox
                  label="Has 4S Market Data"
                  checked={has4SData}
                  onChange={(e) => updateStockMarketAccess({ has4SData: e.target.checked })}
                />
              </div>

              {/* 4S TIX API */}
              <div className="space-y-3 p-4 border border-terminal-dim">
                <h4 className="text-terminal-secondary text-sm uppercase tracking-wide">
                  &gt; 4S Market Data TIX API
                </h4>
                <p className="text-terminal-dim text-xs">
                  API access to 4S market data. Enables programmatic access to forecasts.
                </p>
                <Checkbox
                  label="Has 4S TIX API"
                  checked={has4STixApi}
                  onChange={(e) => updateStockMarketAccess({ has4SDataTixApi: e.target.checked })}
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-terminal-dim text-xs border-t border-terminal-dim pt-4">
              <p>
                <span className="text-terminal-secondary">Note:</span> WSE Account is required to view the stock market in-game.
                TIX API access enables the <code className="text-terminal-primary">stock</code> NetScript API functions.
                4S data provides forecast and volatility information.
              </p>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'positions',
      label: 'Positions',
      notImplemented: true,
      content: (
        <Card title="Stock Positions" subtitle="View and edit stock positions (schema implementation required)">
          <p className="text-terminal-dim">
            {stockMarketSave
              ? 'Stock position data exists but requires schema implementation to edit.'
              : 'No stock market data in save file.'}
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
      notImplemented: true,
      content: (
        <Card title="Open Orders" subtitle="View and edit open orders (schema implementation required)">
          <p className="text-terminal-dim">
            {stockMarketSave
              ? 'Order data may exist but requires schema implementation to edit.'
              : 'No stock market data in save file.'}
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

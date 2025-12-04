import LiveMarketApp from './LiveMarketApp';
import NewsApp from './NewsApp';
import OrderTicketApp from './OrderTicketApp';

const registry = {
  "live-market": LiveMarketApp,
  "news": NewsApp,
  "order-ticket": OrderTicketApp,
};

interface AppHostProps {
  appId: string;
}

function AppHost({ appId }: AppHostProps) {
  const AppComponent = registry[appId as keyof typeof registry];

  if (!AppComponent) {
    return <div>Unknown appId: {appId}</div>;
  }

  return <AppComponent />;
}

export default AppHost;

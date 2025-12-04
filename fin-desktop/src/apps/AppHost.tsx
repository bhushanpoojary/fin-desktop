import LiveMarketApp from './LiveMarketApp';
import NewsApp from './NewsApp';
import OrderTicketApp from './OrderTicketApp';
import { InstrumentSourceApp } from './InstrumentSourceApp';
import { InstrumentTargetApp } from './InstrumentTargetApp';
import { Fdc3EventsLogScreen } from './Fdc3EventsLogScreen';

const registry = {
  "live-market": LiveMarketApp,
  "news": NewsApp,
  "order-ticket": OrderTicketApp,
  "instrument-source": InstrumentSourceApp,
  "instrument-target": InstrumentTargetApp,
  "fdc3-events-log": Fdc3EventsLogScreen,
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

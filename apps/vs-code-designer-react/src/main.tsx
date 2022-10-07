import { App } from './app/app';
import { store } from './state/Store';
import { WebViewCommunication } from './webviewCommunication';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '@microsoft/designer-ui';
import { IntlProvider } from 'react-intl';
import type { OnErrorFn } from '@formatjs/intl';
import TelemetryReporter from '@vscode/extension-telemetry';

// all events will be prefixed with this event name
const extensionId = 'dsadasdas';

// extension version will be reported as a property with each event
const extensionVersion = '<adsdsadasas';

// the application insights key (also known as instrumentation key)
const key = '2fc394da-7c11-4c1c-b776-17763031415d';

// telemetry reporter
let reporter = new TelemetryReporter(extensionId, extensionVersion, key);

const onError = (error: any, errorInfo: any) => {
  // You can also log the error to an error reporting service
  // send event any time after activation
  console.log('charlie',error)
  console.log('charlie',errorInfo)
  reporter.sendTelemetryEvent('testReact', { 'stringProp': 'some string' }, { 'numericMeasure': 123 });
}
const handleError: OnErrorFn = (err) => {
  if (err.code !== 'MISSING_TRANSLATION') {
    throw err;
  }
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <StrictMode>
    <IntlProvider defaultLocale="en" locale="en-US" messages={{}} onError={handleError}>
      <ErrorBoundary onError={onError}>
      <Provider store={store}>
        <WebViewCommunication>
          <App />
        </WebViewCommunication>
      </Provider>
      </ErrorBoundary>
    </IntlProvider>
  </StrictMode>
);

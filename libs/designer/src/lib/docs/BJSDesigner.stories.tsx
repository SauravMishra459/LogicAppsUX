import type { Workflow } from '../common/models/workflow';
import type { DesignerOptionsState } from '../core/state/designerOptions/designerOptionsInterfaces';
import { BJSWorkflowProvider, Designer, DesignerProvider } from '../index';
import AllScopesWorkflow from './storybookWorkflows/allScopesWorkflow.json';
import ConnectionsWorkflow from './storybookWorkflows/connectionsWorkflow.json';
import RunAfterWorkflow from './storybookWorkflows/runAfterWorkflow.json';
import BigWorkflow from './storybookWorkflows/simpleBigworkflow.json';
import SimpleWorkflow from './storybookWorkflows/simpleSmallWorkflow.json';
import {
  StandardConnectionService,
  StandardOAuthService,
  StandardOperationManifestService,
  StandardSearchService,
} from '@microsoft/designer-client-services-logic-apps';
import { ResourceIdentityType } from '@microsoft/utils-logic-apps';

export default {
  component: DesignerProvider,
  subcomponents: { BJSWorkflowProvider, Designer },
  title: 'Designer/Designer Composition',
};

interface ComponentProps {
  workflow: Workflow;
  options?: Partial<DesignerOptionsState>;
}

const httpClient = {
  dispose: () => Promise.resolve({} as any),
  get: () => Promise.resolve({} as any),
  post: () => Promise.resolve({} as any),
  put: () => Promise.resolve({} as any),
  delete: () => Promise.resolve({} as any),
};
const RenderedComponent = (props: ComponentProps) => (
  <div style={{ height: '100vh' }}>
    <DesignerProvider
      locale="en-US"
      options={{
        ...props.options,
        services: {
          connectionService: new StandardConnectionService({
            baseUrl: '/url',
            apiVersion: '2018-11-01',
            httpClient,
            apiHubServiceDetails: {
              apiVersion: '2018-07-01-preview',
              baseUrl: '/baseUrl',
              subscriptionId: '',
              resourceGroup: '',
              location: '',
            },
            workflowAppDetails: { appName: 'app', identity: { type: ResourceIdentityType.SYSTEM_ASSIGNED } },
            readConnections: () => Promise.resolve({}),
          }),
          operationManifestService: new StandardOperationManifestService({
            apiVersion: '2018-11-01',
            baseUrl: '/url',
            httpClient,
          }),
          searchService: new StandardSearchService({
            baseUrl: '/url',
            apiVersion: '2018-11-01',
            httpClient,
            apiHubServiceDetails: {
              apiVersion: '2018-07-01-preview',
              subscriptionId: '',
              location: '',
            },
            isDev: true,
          }),
          oAuthService: new StandardOAuthService({
            baseUrl: '/url',
            apiVersion: '2018-11-01',
            httpClient,
            subscriptionId: '',
            resourceGroup: '',
            location: '',
          }),
          workflowService: { getCallbackUrl: () => Promise.resolve({ method: 'POST', value: 'Dummy url' }) },
        },
      }}
    >
      <BJSWorkflowProvider workflow={props.workflow}>
        <Designer></Designer>
      </BJSWorkflowProvider>
    </DesignerProvider>
  </div>
);

export const SimpleButBigDefinition = () => <RenderedComponent workflow={BigWorkflow as Workflow} options={{}} />;

export const ReadOnlyExample = () => <RenderedComponent workflow={SimpleWorkflow as Workflow} options={{ readOnly: true }} />;

export const MonitoringViewExample = () => (
  <RenderedComponent workflow={SimpleWorkflow as Workflow} options={{ readOnly: true, isMonitoringView: true, isDarkMode: false }} />
);

export const ConnectionsExample = () => <RenderedComponent workflow={ConnectionsWorkflow.files as Workflow} options={{}} />;

export const ScopesExample = () => <RenderedComponent workflow={AllScopesWorkflow as Workflow} />;

export const RunAfterExample = () => <RenderedComponent workflow={RunAfterWorkflow as Workflow} />;

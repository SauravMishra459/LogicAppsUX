
import type { AzureResourcePageProps, AzureResourcePickerProps } from './';
import { AzureResourcePicker } from './';
import { useArgs } from '@storybook/client-api';
import { useCallback, useEffect, useState } from 'react';


const DataPage1 = {
  resourceType: 'app',
  getResourceCallback: () => [
    {
      id: 'test-app',
      name: 'Test App',
      properties: {
        resourceGroup: 'TestResourceGroup',
      },
      location: 'westus',
    },
  ],
  selectedResource: undefined,
  selectResourceCallback: () => [],
};

const DataPage2 = {
  resourceType: 'function',
  getResourceCallback: () => [
    {
      id: 'test-func-1',
      name: 'Test Function 1',
      properties: {
        resourceGroup: 'TestResourceGroup',
      },
      location: 'westus',
    },
    {
      id: 'test-func-2',
      name: 'Test Function 2',
      properties: {
        resourceGroup: 'TestResourceGroup',
      },
      location: 'westus',
    },
  ],
  selectedResource: undefined,
  selectResourceCallback: () => [],
};

export default {
  title: 'Components/AzureResourcePicker',
  component: AzureResourcePicker,
  args: {
    key: 'root',
    resourcePages: [
      DataPage1,
      DataPage2,
    ],
  },
};


export const Playground = (args: AzureResourcePickerProps) => {
  
  const [resourcePages, setResourcePages] = useState<AzureResourcePageProps[]>(args.resourcePages);
  const [selectedResources, setSelectedResources] = useState<any[]>([]);

  const selectPage1Callback = useCallback((resource?: any) => {
    console.log('selectPage1Callback', resource);
    if (resource) setSelectedResources([resource]);
    else
      setSelectedResources([]);
  }, []);

  const selectPage2Callback = useCallback((resource?: any) => {
    console.log('selectPage2Callback', resource);
    if (resource) setSelectedResources([selectedResources[0], resource]);
    else
      setSelectedResources([selectedResources[0]]);
  }, [selectedResources]);

  useEffect(() => setResourcePages([
    {
      ...DataPage1,
      selectResourceCallback: selectPage1Callback,
      selectedResource: selectedResources[0],
    },
    {
      ...DataPage2,
      selectResourceCallback: selectPage2Callback,
      selectedResource: selectedResources[1],
    },
  ]), [selectedResources, selectPage1Callback, selectPage2Callback]);

  return (
    <div style={{maxWidth: '600px'}}>
      <AzureResourcePicker key={args.key} resourcePages={resourcePages} />
    </div>
  );
};


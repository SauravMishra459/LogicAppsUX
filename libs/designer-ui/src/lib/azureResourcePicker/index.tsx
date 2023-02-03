import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import type { IBreadcrumbItem } from '@fluentui/react';
import { css, Label, Spinner, List, MessageBar, MessageBarType, Text, Breadcrumb } from '@fluentui/react';
import { useQuery } from 'react-query';


export interface AzureResourcePageProps {
  resourceType: string;
  getResourceCallback: (any?: any) => any;
  selectedResource: any;
  selectResourceCallback: (resourceId?: string) => void;
}

export interface AzureResourcePickerProps {
  key: string;
  resourcePages: AzureResourcePageProps[];
};


export const AzureResourcePicker = (props: AzureResourcePickerProps) => {
  const { key, resourcePages } = props;

  const intl = useIntl();
  
  const resourcesLabel = intl.formatMessage({
    defaultMessage: 'Select an Azure resource',
    description: 'Label for Azure resource selection',
  });

  const resourcesLoadingText = intl.formatMessage({
    defaultMessage: 'Loading Azure Resources...',
    description: 'Text for loading function apps',
  });

  const noResoucesText = intl.formatMessage({
    defaultMessage: 'No resources of this type found under this subscription.',
    description: 'Message to show when no functions are found',
  });
  
  const selectedResources = useMemo(() => resourcePages.map((page) => page.selectedResource).filter((r) => !!r), [resourcePages]);
  const selectedResource = useMemo(() => (selectedResources.length > 0) ? selectedResources[selectedResources.length - 1] : undefined, [selectedResources]);

  const currentDepth = useMemo(() => (
    (selectedResources.length >= resourcePages.length) ? selectedResources.length - 1 : selectedResources.length
  ), [resourcePages.length, selectedResources.length]);

  const { resourceType, getResourceCallback, selectResourceCallback } = useMemo(() => {
    return resourcePages[currentDepth];
  }, [resourcePages, currentDepth]);

  const resourceQuery = useQuery([key, resourceType], async () => getResourceCallback() ?? [], {
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24,
  });
  
  const currentResources = useMemo(() => {
    if (resourceQuery.isLoading || !resourceQuery.isFetched) return [];

    const data = (resourceQuery?.data ?? []) as any[];
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }, [resourceQuery]);

  const breadcrumbRootText = intl.formatMessage({
    defaultMessage: 'Resources',
    description: 'Text for breadcrumb root',
  });

  const JumpToPage = useCallback((pageNum: number) => {
    for (let i = resourcePages.length-1; i > pageNum-1; i--)
      resourcePages[i].selectResourceCallback(undefined);
  }, [resourcePages]);

  const breadcrumbItems = useMemo(() => {
    const items: IBreadcrumbItem[] = [{
      text: breadcrumbRootText,
      key: breadcrumbRootText,
      onClick: () => JumpToPage(0),
    }];
    for (let i = 0; i < currentDepth; i++) {
      items.push({
        text: resourcePages[i].selectedResource?.name,
        key: resourcePages[i].selectedResource?.id,
        onClick: () => JumpToPage(i+1),
      });
    }
    items[items.length - 1].isCurrentItem = true;
    items[items.length - 1].onClick = undefined;
    return items;
  }, [JumpToPage, breadcrumbRootText, currentDepth, resourcePages]);

  
  return (
    <div>
      <Label className="label" required>
        {resourcesLabel}
      </Label>
      <div className="msla-azure-resources-container">
        <Breadcrumb
          items={breadcrumbItems}
          ariaLabel="Breadcrumb with items rendered as buttons"
        />
        <div className="msla-azure-resource-list-header">
          <Text>{'Name'}</Text>
          <Text>{'Resource Group'}</Text>
          <Text>{'Location'}</Text>
        </div>
        {
          resourceQuery?.isLoading ? (
            <Spinner label={resourcesLoadingText} style={{ margin: '16px' }} />
          ) : resourceQuery?.isSuccess ? (
            currentResources?.length < 1 ? (
              <Text style={{ margin: '16px', textAlign: 'center' }}>{noResoucesText}</Text>
            ) : (
              <div className="msla-azure-resources-list-container" data-is-scrollable>
                <List
                  items={currentResources.map((resource) => ({
                    ...resource,
                    selected: selectedResource?.id === resource.id,
                    selectedResource,
                  }))}
                  onRenderCell={(resource) => (
                    <div className={css("msla-azure-resource-entry", resource.selected ? "selected" : null)} >
                      <button onClick={() => selectResourceCallback(resource)} >
                        <Text>{resource?.name}</Text>
                        <Text>{resource?.properties?.resourceGroup}</Text>
                        <Text>{resource?.location}</Text>
                      </button>
                    </div>
                  )}
                />
              </div>
            )
          ) : resourceQuery?.isError ? (
            <MessageBar messageBarType={MessageBarType.error} style={{ margin: '16px' }}>
              {resourceQuery?.error as string}
            </MessageBar>
          ) : null
        }
      </div>
    </div>
  );
};

import constants from '../../../common/constants';
import { useConnectionsForConnector } from '../../../core/queries/connections';
import { useConnectorByNodeId } from '../../../core/state/connection/connectionSelector';
import { changeConnectionMapping } from '../../../core/state/connection/connectionSlice';
import { useSelectedNodeId } from '../../../core/state/panel/panelSelectors';
import { isolateTab, selectPanelTab, showDefaultTabs } from '../../../core/state/panel/panelSlice';
import { useNodeConnectionId } from '../../../core/state/selectors/actionMetadataSelector';
import type { Connection } from '@microsoft-logic-apps/utils';
import { getIdLeaf } from '@microsoft-logic-apps/utils';
import type { PanelTab } from '@microsoft/designer-ui';
import { SelectConnection } from '@microsoft/designer-ui';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

export const SelectConnectionTab = () => {
  const dispatch = useDispatch();

  const selectedNodeId = useSelectedNodeId();
  const currentConnectionId = useNodeConnectionId(selectedNodeId);

  const hideConnectionTabs = useCallback(() => {
    dispatch(showDefaultTabs());
    dispatch(selectPanelTab(constants.PANEL_TAB_NAMES.PARAMETERS));
  }, [dispatch]);

  const createConnectionCallback = useCallback(() => {
    dispatch(isolateTab(constants.PANEL_TAB_NAMES.CONNECTION_CREATE));
  }, [dispatch]);

  const connector = useConnectorByNodeId(selectedNodeId);
  const connectionQuery = useConnectionsForConnector(connector?.id ?? '');
  const connections = useMemo(() => connectionQuery.data ?? [], [connectionQuery]);

  useEffect(() => {
    if (connections.length === 0) createConnectionCallback();
  }, [connections, createConnectionCallback]);

  // TODO: RILEY - RACE CONDITION HERE, if you are on select connection and you click another node, this fires off, and sets the old node's connection to the same as the new node's connection
  // We really just need to make our own selection component here, using the 'DetailsList' component here is just really hacky and not the way it was intended to be used
  const saveSelectionCallback = useCallback(
    (connection?: Connection) => {
      if (!connection) return;
      dispatch(changeConnectionMapping({ nodeId: selectedNodeId, connectionId: getIdLeaf(connection?.id) }));
      hideConnectionTabs();
    },
    [dispatch, selectedNodeId, hideConnectionTabs]
  );

  const cancelSelectionCallback = useCallback(() => {
    hideConnectionTabs();
  }, [hideConnectionTabs]);

  return (
    <SelectConnection
      connections={connections}
      currentConnectionId={currentConnectionId}
      saveSelectionCallback={saveSelectionCallback}
      cancelSelectionCallback={cancelSelectionCallback}
      createConnectionCallback={createConnectionCallback}
    />
  );
};

export const selectConnectionTab: PanelTab = {
  title: 'Select Connection',
  name: constants.PANEL_TAB_NAMES.CONNECTION_SELECTOR,
  description: 'Select Connection Tab',
  visible: true,
  content: <SelectConnectionTab />,
  order: 0,
};

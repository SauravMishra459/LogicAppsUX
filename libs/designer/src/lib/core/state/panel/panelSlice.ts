import constants from '../../../common/constants';
import type { RelationshipIds, PanelState } from './panelInterfaces';
import type { PanelTab } from '@microsoft/designer-ui';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: PanelState = {
  collapsed: true,
  selectedNode: '',
  relationshipIds: {
    graphId: 'root',
  },
  isDiscovery: false,
  isParallelBranch: false,
  isWorkflowParameters: false,
  registeredTabs: {},
  selectedTabName: undefined,
  selectedOperationGroupId: '',
  addingTrigger: false,
  tokenPickerVisibility: true,
};

export const panelSlice = createSlice({
  name: 'panel',
  initialState,
  reducers: {
    showTokenPicker: (state) => {
      state.tokenPickerVisibility = true;
    },
    hideTokenPicker: (state) => {
      state.tokenPickerVisibility = false;
    },
    expandPanel: (state) => {
      state.collapsed = false;
    },
    collapsePanel: (state) => {
      state.collapsed = true;
      state.selectedOperationGroupId = '';
    },
    clearPanel: (state) => {
      state.collapsed = true;
      state.isDiscovery = false;
      state.isWorkflowParameters = false;
      state.selectedNode = '';
      state.selectedOperationGroupId = '';
    },
    changePanelNode: (state, action: PayloadAction<string>) => {
      if (!action) return;
      if (state.collapsed) state.collapsed = false;
      state.selectedNode = action.payload;
      state.isDiscovery = false;
      state.isWorkflowParameters = false;
      state.selectedOperationGroupId = '';
    },
    expandDiscoveryPanel: (
      state,
      action: PayloadAction<{ relationshipIds: RelationshipIds; nodeId: string; isParallelBranch?: boolean; addingTrigger?: boolean }>
    ) => {
      state.collapsed = false;
      state.isDiscovery = true;
      state.isWorkflowParameters = false;
      state.relationshipIds = action.payload.relationshipIds;
      state.selectedNode = action.payload.nodeId;
      state.isParallelBranch = action.payload?.isParallelBranch ?? false;
      state.addingTrigger = !!action.payload?.addingTrigger;
    },
    selectOperationGroupId: (state, action: PayloadAction<string>) => {
      state.selectedOperationGroupId = action.payload;
    },
    switchToOperationPanel: (state, action: PayloadAction<string>) => {
      state.selectedNode = action.payload;
      state.isDiscovery = false;
      state.isWorkflowParameters = false;
      state.selectedOperationGroupId = '';
    },
    switchToWorkflowParameters: (state) => {
      state.collapsed = false;
      state.isWorkflowParameters = true;
      state.isDiscovery = false;
      state.selectedNode = '';
      state.selectedOperationGroupId = '';
    },
    registerPanelTabs: (state, action: PayloadAction<Array<PanelTab>>) => {
      action.payload.forEach((tab) => {
        state.registeredTabs[tab.name.toLowerCase()] = tab;
      });
    },
    setTabError: (state, action: PayloadAction<{ tabName: string; hasErrors: boolean; nodeId: string }>) => {
      const tabName = action.payload.tabName.toLowerCase();
      const { nodeId, hasErrors } = action.payload;
      if (tabName) {
        state.registeredTabs[tabName] = {
          ...state.registeredTabs[tabName],
          tabErrors: {
            ...state.registeredTabs[tabName].tabErrors,
            [nodeId]: hasErrors,
          },
        };
      }
    },
    unregisterPanelTab: (state, action: PayloadAction<string>) => {
      delete state.registeredTabs[action.payload];
    },
    setTabVisibility: (state, action: PayloadAction<{ tabName: string; visible?: boolean }>) => {
      const tabName = action.payload.tabName.toLowerCase();
      if (tabName) {
        state.registeredTabs[tabName] = {
          ...state.registeredTabs[tabName],
          visible: !!action.payload.visible,
        };
      }
    },
    showDefaultTabs: (state, action: PayloadAction<{ isScopeNode?: boolean; isMonitoringView?: boolean } | undefined>) => {
      const isMonitoringView = action.payload?.isMonitoringView;
      const isScopeNode = action.payload?.isScopeNode;
      const defaultTabs = [
        constants.PANEL_TAB_NAMES.ABOUT,
        constants.PANEL_TAB_NAMES.CODE_VIEW,
        constants.PANEL_TAB_NAMES.SETTINGS,
        constants.PANEL_TAB_NAMES.SCRATCH,
      ];

      isMonitoringView
        ? defaultTabs.unshift(constants.PANEL_TAB_NAMES.MONITORING)
        : defaultTabs.unshift(constants.PANEL_TAB_NAMES.PARAMETERS);

      if (isScopeNode && !isMonitoringView) {
        defaultTabs.shift();
      }

      Object.values(state.registeredTabs as Record<string, PanelTab>).forEach((tab) => {
        if (state.registeredTabs[tab.name.toLowerCase()]) {
          state.registeredTabs[tab.name.toLowerCase()] = { ...tab, visible: defaultTabs.includes(tab.name) };
        }
      });
    },
    isolateTab: (state, action: PayloadAction<string>) => {
      Object.values(state.registeredTabs as Record<string, PanelTab>).forEach((tab) => {
        state.registeredTabs[tab.name.toLowerCase()] = { ...tab, visible: tab.name === action.payload };
      });
      state.selectedTabName = action.payload;
    },
    selectPanelTab: (state, action: PayloadAction<string | undefined>) => {
      state.selectedTabName = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  showTokenPicker,
  hideTokenPicker,
  expandPanel,
  collapsePanel,
  clearPanel,
  changePanelNode,
  expandDiscoveryPanel,
  selectOperationGroupId,
  switchToOperationPanel,
  registerPanelTabs,
  unregisterPanelTab,
  showDefaultTabs,
  setTabVisibility,
  isolateTab,
  selectPanelTab,
  setTabError,
  switchToWorkflowParameters,
} = panelSlice.actions;

export default panelSlice.reducer;

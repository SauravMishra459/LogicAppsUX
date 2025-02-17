import { localSettingsFileName, managementApiPrefix } from '../../../../constants';
import { ext } from '../../../../extensionVariables';
import { localize } from '../../../../localize';
import { getLocalSettingsJson } from '../../../utils/appSettings/localSettings';
import {
  cacheWebviewPanel,
  getArtifactsInLocalProject,
  getAzureConnectorDetailsForLocalProject,
  getCodelessAppData,
  removeWebviewPanelFromCache,
} from '../../../utils/codeless/common';
import {
  containsApiHubConnectionReference,
  getConnectionsAndSettingsToUpdate,
  getConnectionsFromFile,
  getFunctionProjectRoot,
  getParametersFromFile,
  saveConectionReferences,
} from '../../../utils/codeless/connection';
import { saveParameters } from '../../../utils/codeless/parameter';
import { startDesignTimeApi } from '../../../utils/codeless/startDesignTimeApi';
import { sendRequest } from '../../../utils/requestUtils';
import { OpenDesignerBase } from './openDesignerBase';
import { HTTP_METHODS } from '@microsoft/utils-logic-apps';
import type { IActionContext } from '@microsoft/vscode-azext-utils';
import type { AzureConnectorDetails, IDesignerPanelMetadata, Parameter } from '@microsoft/vscode-extension';
import { ExtensionCommand } from '@microsoft/vscode-extension';
import { writeFileSync, readFileSync } from 'fs';
import * as path from 'path';
import * as requestP from 'request-promise';
import { ProgressLocation, Uri, ViewColumn, window, workspace } from 'vscode';
import type { WebviewPanel, ProgressOptions } from 'vscode';

export default class OpenDesignerForLocalProject extends OpenDesignerBase {
  private readonly workflowFilePath: string;
  private migrationOptions: Record<string, any>;
  private projectPath: string | undefined;
  private panelMetadata: IDesignerPanelMetadata;

  constructor(context: IActionContext, node: Uri) {
    const workflowName = path.basename(path.dirname(node.fsPath));
    const apiVersion = '2019-10-01-edge-preview';
    const panelName = `${workspace.name}-${workflowName}`;
    const panelGroupKey = ext.webViewKey.designerLocal;

    super(context, workflowName, panelName, apiVersion, panelGroupKey, false, true);

    this.workflowFilePath = node.fsPath;
  }

  public async createPanel(): Promise<void> {
    const existingPanel: WebviewPanel | undefined = this.getExistingPanel();

    if (existingPanel) {
      this.panel = existingPanel;
      if (!existingPanel.active) {
        existingPanel.reveal(ViewColumn.Active);
        return;
      }
      return;
    }

    this.projectPath = await getFunctionProjectRoot(this.context, this.workflowFilePath);
    if (!this.projectPath) {
      throw new Error(localize('FunctionRootFolderError', 'Unable to determine function project root folder.'));
    }

    await startDesignTimeApi(this.projectPath);

    this.baseUrl = `http://localhost:${ext.workflowDesignTimePort}${managementApiPrefix}`;

    this.panel = window.createWebviewPanel(
      this.panelGroupKey, // Key used to reference the panel
      this.panelName, // Title display in the tab
      ViewColumn.Active, // Editor column to show the new webview panel in.
      this.getPanelOptions()
    );

    this.migrationOptions = await this._getMigrationOptions(this.baseUrl);
    this.panelMetadata = await this._getDesignerPanelMetadata(this.migrationOptions);

    this.panel.webview.html = await this.getWebviewContent({
      connectionsData: this.panelMetadata.connectionsData,
      parametersData: this.panelMetadata.parametersData || {},
      localSettings: this.panelMetadata.localSettings,
      artifacts: this.panelMetadata.artifacts,
      azureDetails: this.panelMetadata.azureDetails,
    });

    this.panel.webview.onDidReceiveMessage(async (message) => await this._handleWebviewMsg(message), ext.context.subscriptions);

    this.panel.onDidDispose(
      () => {
        removeWebviewPanelFromCache(this.panelGroupKey, this.panelName);
      },
      null,
      ext.context.subscriptions
    );

    cacheWebviewPanel(this.panelGroupKey, this.panelName, this.panel);
    ext.context.subscriptions.push(this.panel);
  }

  private async _handleWebviewMsg(msg: any) {
    switch (msg.command) {
      case ExtensionCommand.initialize: {
        this.sendMsgToWebview({
          command: ExtensionCommand.initialize_frame,
          data: {
            panelMetadata: this.panelMetadata,
            connectionReferences: this.connectionReferences,
            baseUrl: this.baseUrl,
            apiVersion: this.apiVersion,
            apiHubServiceDetails: this.apiHubServiceDetails,
            readOnly: this.readOnly,
            isLocal: this.isLocal,
          },
        });
        break;
      }
      case ExtensionCommand.save: {
        await this.saveWorkflow(
          this.workflowFilePath,
          this.panelMetadata.workflowContent,
          msg,
          this.panelMetadata.azureDetails?.tenantId,
          this.panelMetadata.azureDetails?.workflowManagementBaseUrl
        );
        await this.validateWorkflow(this.panelMetadata.workflowContent);
        break;
      }
      default:
        break;
    }
  }

  private async saveWorkflow(
    filePath: string,
    workflow: any,
    workflowToSave: any,
    azureTenantId?: string,
    workflowBaseManagementUri?: string
  ): Promise<void> {
    const options: ProgressOptions = {
      location: ProgressLocation.Notification,
      title: localize('azureFunctions.savingWorkflow', 'Saving Workflow...'),
    };

    await window.withProgress(options, async () => {
      try {
        const { definition, parameters } = workflowToSave;

        const definitionToSave: any = definition;
        const parametersFromDefinition = definitionToSave.parameters;
        if (parametersFromDefinition) {
          delete parametersFromDefinition.$connections;
          for (const parameterKey of Object.keys(parametersFromDefinition)) {
            const parameter = parametersFromDefinition[parameterKey];
            parameter.value = parameter.defaultValue;
            delete parameter.defaultValue;
          }
          delete definitionToSave.parameters;
          await saveParameters(this.context, filePath, parametersFromDefinition);
        }

        workflow.definition = definitionToSave;

        if (parameters?.$connections?.value) {
          const connectionsAndSettingsToUpdate = await getConnectionsAndSettingsToUpdate(
            this.context,
            filePath,
            parameters.$connections.value,
            azureTenantId,
            workflowBaseManagementUri
          );
          await saveConectionReferences(this.context, filePath, connectionsAndSettingsToUpdate);

          if (containsApiHubConnectionReference(parameters.$connections.value)) {
            window.showInformationMessage(localize('keyValidity', 'The connection will be valid for 7 days only.'), 'OK');
          }
        }

        writeFileSync(filePath, JSON.stringify(workflow, null, 4));
      } catch (error) {
        window.showErrorMessage(`${localize('saveFailure', 'Workflow not saved.')} ${error.message}`, localize('OK', 'OK'));
        throw error;
      }
    });
  }

  private async validateWorkflow(workflow: any): Promise<void> {
    const url = `http://localhost:${ext.workflowDesignTimePort}${managementApiPrefix}/workflows/${this.workflowName}/validate?api-version=${this.apiVersion}`;
    try {
      await sendRequest(this.context, {
        url,
        method: HTTP_METHODS.POST,
        headers: { ['Content-Type']: 'application/json' },
        body: JSON.stringify({ properties: workflow }),
      });
    } catch (error) {
      if (error.statusCode !== 404) {
        const errorMessage = localize('workflowValidationFailed', 'Workflow validation failed: ') + error.message;
        await window.showErrorMessage(errorMessage, localize('OK', 'OK'));
      }
    }
  }

  private _migrate(workflow: any, migrationOptions: Record<string, any>): void {
    this._traverseActions(workflow.definition?.actions, migrationOptions);
  }

  private _traverseActions(actions: any, migrationOptions: Record<string, any>): void {
    if (actions) {
      for (const actionName of Object.keys(actions)) {
        this._traverseAction(actions[actionName], migrationOptions);
      }
    }
  }

  private _traverseAction(action: any, migrationOptions: Record<string, any>): void {
    const type = action?.type;
    switch ((type || '').toLowerCase()) {
      case 'liquid':
        if (migrationOptions['liquidJsonToJson']?.inputs?.properties?.map?.properties?.source) {
          const map = action?.inputs?.map;
          if (map && map.source === undefined) {
            map.source = 'LogicApp';
          }
        }
        break;
      case 'xmlvalidation':
        if (migrationOptions['xmlValidation']?.inputs?.properties?.schema?.properties?.source) {
          const schema = action?.inputs?.schema;
          if (schema && schema.source === undefined) {
            schema.source = 'LogicApp';
          }
        }
        break;
      case 'xslt':
        if (migrationOptions['xslt']?.inputs?.properties?.map?.properties?.source) {
          const map = action?.inputs?.map;
          if (map && map.source === undefined) {
            map.source = 'LogicApp';
          }
        }
        break;
      case 'flatfileencoding':
      case 'flatfiledecoding':
        if (migrationOptions['flatFileEncoding']?.inputs?.properties?.schema?.properties?.source) {
          const schema = action?.inputs?.schema;
          if (schema && schema.source === undefined) {
            schema.source = 'LogicApp';
          }
        }
        break;
      case 'if':
        this._traverseActions(action.else?.actions, migrationOptions);
      // fall through
      case 'scope':
      case 'foreach':
      case 'changeset':
      case 'until':
        this._traverseActions(action.actions, migrationOptions);
        break;
      case 'switch':
        for (const caseKey of Object.keys(action.cases || {})) {
          this._traverseActions(action.cases[caseKey]?.actions, migrationOptions);
        }
        this._traverseActions(action.default?.actions, migrationOptions);

        break;
    }
  }

  private _getMigrationOptions(baseUrl: string): Promise<Record<string, any>> {
    const flatFileEncodingPromise = requestP({
      json: true,
      method: HTTP_METHODS.GET,
      uri: `${baseUrl}/operationGroups/flatFileOperations/operations/flatFileEncoding?api-version=2019-10-01-edge-preview&$expand=properties/manifest`,
    });
    const liquidJsonToJsonPromise = requestP({
      json: true,
      method: HTTP_METHODS.GET,
      uri: `${baseUrl}/operationGroups/liquidOperations/operations/liquidJsonToJson?api-version=2019-10-01-edge-preview&$expand=properties/manifest`,
    });
    const xmlValidationPromise = requestP({
      json: true,
      method: HTTP_METHODS.GET,
      uri: `${baseUrl}/operationGroups/xmlOperations/operations/xmlValidation?api-version=2019-10-01-edge-preview&$expand=properties/manifest`,
    });
    const xsltPromise = requestP({
      json: true,
      method: HTTP_METHODS.GET,
      uri: `${baseUrl}/operationGroups/xmlOperations/operations/xmlTransform?api-version=2019-10-01-edge-preview&$expand=properties/manifest`,
    });

    return Promise.all([flatFileEncodingPromise, liquidJsonToJsonPromise, xmlValidationPromise, xsltPromise]).then(
      ([ff, liquid, xmlvalidation, xslt]) => {
        return {
          flatFileEncoding: ff.properties.manifest,
          liquidJsonToJson: liquid.properties.manifest,
          xmlValidation: xmlvalidation.properties.manifest,
          xslt: xslt.properties.manifest,
        };
      }
    );
  }

  private async _getDesignerPanelMetadata(migrationOptions: Record<string, any> = {}): Promise<any> {
    const workflowContent: any = JSON.parse(readFileSync(this.workflowFilePath, 'utf8'));
    this._migrate(workflowContent, migrationOptions);
    const connectionsData: string = await getConnectionsFromFile(this.context, this.workflowFilePath);
    const projectPath: string | undefined = await getFunctionProjectRoot(this.context, this.workflowFilePath);
    const parametersData: Record<string, Parameter> = await getParametersFromFile(this.context, this.workflowFilePath);
    let localSettings: Record<string, string>;
    let azureDetails: AzureConnectorDetails;

    if (projectPath) {
      azureDetails = await getAzureConnectorDetailsForLocalProject(this.context, projectPath);
      localSettings = (await getLocalSettingsJson(this.context, path.join(projectPath, localSettingsFileName))).Values;
    } else {
      throw new Error(localize('FunctionRootFolderError', 'Unable to determine function project root folder.'));
    }

    return {
      appSettingNames: Object.keys(localSettings),
      codelessApp: getCodelessAppData(this.workflowName, workflowContent, parametersData),
      scriptPath: this.panel.webview.asWebviewUri(Uri.file(path.join(ext.context.extensionPath, 'dist', 'designer'))).toString(),
      connectionsData,
      parametersData,
      localSettings,
      azureDetails,
      workflowContent,
      artifacts: await getArtifactsInLocalProject(projectPath),
    };
  }
}

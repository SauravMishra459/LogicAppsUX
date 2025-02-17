/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ext } from '../../extensionVariables';
import type { AzExtTreeItem, IActionContext } from '@microsoft/vscode-azext-utils';

export async function deleteNode(context: IActionContext, expectedContextValue: string | RegExp, node?: AzExtTreeItem): Promise<void> {
  if (!node) {
    node = await ext.tree.showTreeItemPicker(expectedContextValue, { ...context, suppressCreatePick: true });
  }

  await node.deleteTreeItem(context);
}

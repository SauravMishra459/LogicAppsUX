import type { MapCheckerEntry } from '../components/mapChecker/MapCheckerItem';
import { MapCheckerItemSeverity } from '../components/mapChecker/MapCheckerItem';
import { sourcePrefix } from '../constants/ReactFlowConstants';
import type { FunctionData, SchemaNodeDictionary, SchemaNodeExtended } from '../models';
import { NormalizedDataType, SchemaNodeProperty } from '../models';
import type { Connection, ConnectionDictionary } from '../models/Connection';
import {
  flattenInputs,
  isCustomValue,
  isValidConnectionByType,
  isValidCustomValueByType,
  nodeHasSourceNodeEventually,
} from './Connection.Utils';
import { isFunctionData } from './Function.Utils';
import { isSchemaNodeExtended } from './Schema.Utils';
import { defineMessages } from 'react-intl';

export const collectErrorsForMapChecker = (connections: ConnectionDictionary, _targetSchema: SchemaNodeDictionary): MapCheckerEntry[] => {
  const errors: MapCheckerEntry[] = [];

  // Valid input types
  Object.entries(connections).forEach(([_connectionKey, connectionValue]) => {
    const node = connectionValue.self.node;

    if (isFunctionData(node)) {
      if (!areInputTypesValidForFunction(node, connectionValue)) {
        errors.push({
          title: { message: mapCheckerResources.inputTypeMismatchTitle },
          description: { message: mapCheckerResources.inputTypeMismatchBody, value: { nodeName: node.displayName } },
          severity: MapCheckerItemSeverity.Error,
          reactFlowId: connectionValue.self.reactFlowKey,
        });
      }

      if (!functionHasRequiredInputs(node, connectionValue)) {
        errors.push({
          title: { message: mapCheckerResources.functionMissingInputsTitle },
          description: { message: mapCheckerResources.functionMissingInputsBody, value: { functionName: node.displayName } },
          severity: MapCheckerItemSeverity.Error,
          reactFlowId: connectionValue.self.reactFlowKey,
        });
      }
    } else {
      if (!connectionValue.self.reactFlowKey.startsWith(sourcePrefix) && !areInputTypesValidForSchemaNode(node, connectionValue)) {
        errors.push({
          title: { message: mapCheckerResources.inputTypeMismatchTitle },
          description: { message: mapCheckerResources.inputTypeMismatchBody, value: { nodeName: node.name } },
          severity: MapCheckerItemSeverity.Error,
          reactFlowId: connectionValue.self.reactFlowKey,
        });
      }
    }
  });

  return errors;
};

export const collectWarningsForMapChecker = (connections: ConnectionDictionary, targetSchema: SchemaNodeDictionary): MapCheckerEntry[] => {
  const warnings: MapCheckerEntry[] = [];

  // Required target schema fields
  Object.entries(targetSchema).forEach(([reactFlowId, schemaValue]) => {
    if (
      schemaValue.normalizedDataType !== NormalizedDataType.ComplexType &&
      schemaValue.nodeProperties.indexOf(SchemaNodeProperty.Optional) === -1
    ) {
      const connection = connections[reactFlowId];
      if (!nodeHasSourceNodeEventually(connection, connections)) {
        warnings.push({
          title: { message: mapCheckerResources.requiredSchemaNodeTitle },
          description: { message: mapCheckerResources.requiredSchemaNodeBody, value: { functionName: schemaValue.name } },
          severity: MapCheckerItemSeverity.Warning,
          reactFlowId,
        });
      }
    }
  });

  return warnings;
};

export const collectInfoForMapChecker = (_connections: ConnectionDictionary, _targetSchema: SchemaNodeDictionary): MapCheckerEntry[] => {
  const info: MapCheckerEntry[] = [];

  return info;
};

export const collectOtherForMapChecker = (_connections: ConnectionDictionary, _targetSchema: SchemaNodeDictionary): MapCheckerEntry[] => {
  const other: MapCheckerEntry[] = [];

  return other;
};

export const areInputTypesValidForSchemaNode = (selfNode: SchemaNodeExtended, connection: Connection): boolean => {
  const input = flattenInputs(connection.inputs)[0];
  if (input === undefined) {
    return true;
  }

  if (isCustomValue(input)) {
    return isValidCustomValueByType(input, selfNode.normalizedDataType);
  } else {
    if (isSchemaNodeExtended(input.node)) {
      return isValidConnectionByType(selfNode.normalizedDataType, input.node.normalizedDataType);
    } else {
      return isValidConnectionByType(selfNode.normalizedDataType, input.node.outputValueType);
    }
  }
};

export const areInputTypesValidForFunction = (functionData: FunctionData, connection: Connection): boolean => {
  let isEveryInputValid = true;

  Object.values(connection.inputs).forEach((inputArr, inputIdx) => {
    inputArr.forEach((inputVal) => {
      let inputValMatchedOneOfAllowedTypes = false;

      functionData.inputs[inputIdx].allowedTypes.forEach((allowedInputType) => {
        if (inputVal !== undefined) {
          if (isCustomValue(inputVal)) {
            if (isValidCustomValueByType(inputVal, allowedInputType)) {
              inputValMatchedOneOfAllowedTypes = true;
            }
          } else {
            if (isSchemaNodeExtended(inputVal.node)) {
              if (isValidConnectionByType(allowedInputType, inputVal.node.normalizedDataType)) {
                inputValMatchedOneOfAllowedTypes = true;
              }
            } else if (isValidConnectionByType(allowedInputType, inputVal.node.outputValueType)) {
              inputValMatchedOneOfAllowedTypes = true;
            }
          }
        }
      });

      if (!inputValMatchedOneOfAllowedTypes) {
        isEveryInputValid = false;
      }
    });
  });

  return isEveryInputValid;
};

export const functionHasRequiredInputs = (functionData: FunctionData, connection: Connection): boolean => {
  let isEveryInputValid = true;

  Object.values(connection.inputs).forEach((inputArr, inputIdx) => {
    if (!functionData.inputs[inputIdx].isOptional && inputArr.length < 1) {
      isEveryInputValid = false;
    }
  });

  return isEveryInputValid;
};

const mapCheckerResources = defineMessages({
  inputTypeMismatchTitle: {
    defaultMessage: 'Input type mismatch',
    description: 'Title for the input type mismatch card',
  },
  inputTypeMismatchBody: {
    defaultMessage: '{nodeName} has an input with a mismatched type',
    description: 'Body text for the input type mismatch card',
  },
  functionMissingInputsTitle: {
    defaultMessage: 'Function is missing required inputs',
    description: 'Title for a function missing a required input card',
  },
  functionMissingInputsBody: {
    defaultMessage: '{functionName} has an non-terminating connection chain',
    description: 'Body text for a function missing a required input card',
  },
  requiredSchemaNodeTitle: {
    defaultMessage: 'Function is missing required inputs',
    description: 'Title for a function missing a required input card',
  },
  requiredSchemaNodeBody: {
    defaultMessage: '{functionName} has an non-terminating connection chain',
    description: 'Body text for a function missing a required input card',
  },
});

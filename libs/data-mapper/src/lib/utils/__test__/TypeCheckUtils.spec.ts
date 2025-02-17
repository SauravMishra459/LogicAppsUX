import type { SchemaNodeExtended } from '../../models';
import { NormalizedDataType, SchemaNodeProperty } from '../../models';
import type { ConnectionUnit, InputConnection } from '../../models/Connection';
import type { FunctionData } from '../../models/Function';
import { FunctionCategory, FunctionType } from '../../models/Function';
import { isConnectionUnit, isCustomValue } from '../Connection.Utils';
import { isFunctionData } from '../Function.Utils';
import { isSchemaNodeExtended } from '../Schema.Utils';

describe('utils/type-checker-utils', () => {
  const mockSchemaNodeExtended: SchemaNodeExtended = {
    key: '',
    name: '',
    fullName: '',
    normalizedDataType: NormalizedDataType.Integer,
    properties: SchemaNodeProperty.NotSpecified,
    nodeProperties: [SchemaNodeProperty.NotSpecified],
    children: [],
    pathToRoot: [],
  };

  const mockFunctionData: FunctionData = {
    key: 'self',
    functionName: 'Self',
    displayName: 'Self',
    category: FunctionCategory.Math,
    description: 'Self',
    type: FunctionType.TransformationFunction,
    inputs: [],
    maxNumberOfInputs: 0,
    outputValueType: NormalizedDataType.Integer,
  };

  it('isSchemaNodeExtended', () => {
    expect(isSchemaNodeExtended(mockFunctionData)).toEqual(false);
    expect(isSchemaNodeExtended(mockSchemaNodeExtended)).toEqual(true);
  });

  it('isFunctionData', () => {
    expect(isFunctionData(mockSchemaNodeExtended)).toEqual(false);
    expect(isFunctionData(mockFunctionData)).toEqual(true);
  });

  it('isCustomValue', () => {
    expect(isCustomValue(undefined)).toEqual(false);
    expect(isCustomValue({} as InputConnection)).toEqual(false);
    expect(isCustomValue('')).toEqual(true);
    expect(isCustomValue('testCustomVal')).toEqual(true);
  });

  it('isConnectionUnit', () => {
    expect(isConnectionUnit(undefined)).toEqual(false);
    expect(isConnectionUnit('testCustomVal')).toEqual(false);
    expect(isConnectionUnit({} as ConnectionUnit)).toEqual(true);
  });
});

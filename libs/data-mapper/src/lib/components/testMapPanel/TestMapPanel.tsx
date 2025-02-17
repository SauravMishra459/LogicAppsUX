import type { TestMapResponse } from '../../core';
import { testDataMap } from '../../core/queries/datamap';
import type { RootState } from '../../core/state/Store';
import { SchemaFileFormat } from '../../models';
import { LogCategory, LogService } from '../../utils/Logging.Utils';
import { ChoiceGroup, DefaultButton, Panel, PanelType, Pivot, PivotItem, PrimaryButton, Text } from '@fluentui/react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import type { MonacoProps } from '@microsoft/designer-ui';
import { EditorLanguage, MonacoEditor } from '@microsoft/designer-ui';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

enum PanelPivotItems {
  Input = 'input',
  Output = 'output',
}

enum InputDataOptions {
  PasteSample = 'pasteSample',
}

export const commonCodeEditorProps: Partial<MonacoProps> = {
  lineNumbers: 'on',
  scrollbar: { horizontal: 'hidden', vertical: 'auto' },
  height: '650px',
  wordWrap: 'on',
  wrappingIndent: 'same',
};

const headerTextStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '16px',
};

const textStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  marginTop: '4px',
};

const useStyles = makeStyles({
  editorStyle: {
    marginTop: '12px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    ...shorthands.borderRadius('3px'),
    ...shorthands.padding('6px'),
  },
  pivotItem: {
    marginTop: '12px',
  },
});

export interface TestMapPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestMapPanel = ({ isOpen, onClose }: TestMapPanelProps) => {
  const intl = useIntl();
  const styles = useStyles();

  const currentTheme = useSelector((state: RootState) => state.app.theme);
  const dataMapXsltFilename = useSelector((state: RootState) => state.dataMap.curDataMapOperation.xsltFilename);
  const sourceSchema = useSelector((state: RootState) => state.dataMap.curDataMapOperation.sourceSchema);
  const targetSchema = useSelector((state: RootState) => state.dataMap.curDataMapOperation.targetSchema);

  const [selectedInputOption, setSelectedInputOption] = useState<InputDataOptions>(InputDataOptions.PasteSample);
  const [selectedPivotItem, setSelectedPivotItem] = useState<PanelPivotItems>(PanelPivotItems.Input);
  const [testMapInput, setTestMapInput] = useState<string>('');
  const [testMapResponse, setTestMapResponse] = useState<TestMapResponse | undefined>(undefined);

  const testMapLoc = intl.formatMessage({
    defaultMessage: 'Test map',
    description: 'Test map panel header',
  });

  const testLoc = intl.formatMessage({
    defaultMessage: 'Test',
    description: 'Test',
  });

  const closeLoc = intl.formatMessage({
    defaultMessage: 'Close',
    description: 'Close',
  });

  const inputLoc = intl.formatMessage({
    defaultMessage: 'Input',
    description: 'Input',
  });

  const outputLoc = intl.formatMessage({
    defaultMessage: 'Output',
    description: 'Output',
  });

  const pasteFromSampleLoc = intl.formatMessage({
    defaultMessage: 'Paste from sample',
    description: 'Paste from sample',
  });

  const inputDataOptionsLabelLoc = intl.formatMessage({
    defaultMessage: 'Provide input data to test the map with',
    description: 'Label for input data option choice group',
  });

  const statusCodeLoc = intl.formatMessage({
    defaultMessage: 'Status code',
    description: 'Response status code for test map API',
  });

  const responseBodyLoc = intl.formatMessage({
    defaultMessage: 'Response body',
    description: 'Response body for test map API',
  });

  const inputDataOptions = useMemo(() => [{ key: 'pasteSample', text: pasteFromSampleLoc }], [pasteFromSampleLoc]);

  const testMap = () => {
    if (!testMapInput) {
      return;
    }

    setSelectedPivotItem(PanelPivotItems.Output);

    testDataMap(dataMapXsltFilename, testMapInput)
      .then((response) => {
        setTestMapResponse(response);

        LogService.log(LogCategory.TestMapPanel, 'testDataMap', {
          message: 'Successfully tested data map',
          statusCode: response.statusCode,
          statusText: response.statusText,
        });
      })
      .catch((error: Error) => {
        LogService.error(LogCategory.TestMapPanel, 'testDataMap', {
          message: error.message,
        });

        setTestMapResponse(undefined);
      });
  };

  const getFooterContent = () => {
    return (
      <div>
        <PrimaryButton onClick={testMap} style={{ marginRight: 8 }} disabled={!testMapInput}>
          {testLoc}
        </PrimaryButton>
        <DefaultButton onClick={onClose}>{closeLoc}</DefaultButton>
      </div>
    );
  };

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onClose}
      type={PanelType.medium}
      headerText={testMapLoc}
      closeButtonAriaLabel={closeLoc}
      onRenderFooterContent={getFooterContent}
      isFooterAtBottom={true}
      overlayProps={{ isDarkThemed: currentTheme === 'dark' }}
      isLightDismiss
    >
      <Pivot
        selectedKey={selectedPivotItem}
        onLinkClick={(item, _event) => setSelectedPivotItem((item?.props.itemKey as PanelPivotItems) ?? PanelPivotItems.Input)}
        style={{ marginTop: 16 }}
      >
        <PivotItem headerText={inputLoc} itemKey={PanelPivotItems.Input} className={styles.pivotItem}>
          <ChoiceGroup
            label={inputDataOptionsLabelLoc}
            selectedKey={selectedInputOption}
            options={inputDataOptions}
            onChange={(_, option) => setSelectedInputOption(option?.key as InputDataOptions)}
          />

          <MonacoEditor
            language={sourceSchema?.type === SchemaFileFormat.JSON ? EditorLanguage.json : EditorLanguage.xml}
            value={testMapInput}
            onContentChanged={(e) => setTestMapInput(e.value ?? '')}
            className={styles.editorStyle}
            {...commonCodeEditorProps}
          />
        </PivotItem>

        <PivotItem headerText={outputLoc} itemKey={PanelPivotItems.Output} className={styles.pivotItem}>
          <Text style={headerTextStyle}>{statusCodeLoc}</Text>
          <Text style={textStyle}>{testMapResponse && `${testMapResponse.statusCode} - ${testMapResponse.statusText}`}</Text>

          <Text style={{ ...headerTextStyle, marginTop: 20 }}>{responseBodyLoc}</Text>
          <MonacoEditor
            language={targetSchema?.type === SchemaFileFormat.JSON ? EditorLanguage.json : EditorLanguage.xml}
            value={testMapResponse?.outputInstance?.$content ?? ''}
            className={styles.editorStyle}
            {...commonCodeEditorProps}
            readOnly
          />
        </PivotItem>
      </Pivot>
    </Panel>
  );
};

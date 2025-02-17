import { SchemaEditor } from '.';
import type { SchemaEditorProps } from '.';
import { ValueSegmentType } from '../editor';
import type { ChangeState } from '../editor/base';
import type { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  component: SchemaEditor,
  title: 'Components/Editor/Monaco/Schema',
} as ComponentMeta<typeof SchemaEditor>;
const Template: ComponentStory<typeof SchemaEditor> = (args: SchemaEditorProps) => <SchemaEditor {...args} />;

export const Standard = Template.bind({});
// https://github.com/microsoft/monaco-editor/issues/2448
Standard.parameters = {
  axe: {
    disabledRules: ['landmark-unique'],
  },
};

Standard.args = {
  initialValue: [{ id: '0', type: ValueSegmentType.LITERAL, value: '{\n"test": true,\n"test2" : \n\t{\n\t\t"object" : "value"\n\t}\n}' }],
  label: 'Request Body JSON Schema',
  onChange: ({ value: segments }: ChangeState) => console.log('Changed value to ', segments[0].value),
};

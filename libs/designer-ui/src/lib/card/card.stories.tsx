// card.stories.js|jsx|ts|tsx
import type { CardProps } from './index';
import { Card } from './index';
import { MenuItemType } from './types';
import { MessageBarType } from '@fluentui/react';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default {
  component: Card,
  title: 'Components/Card',
} as ComponentMeta<typeof Card>;

const Template: ComponentStory<typeof Card> = (args: CardProps) => (
  <DndProvider backend={HTML5Backend}>
    <Card {...args} />
  </DndProvider>
);

export const Standard = Template.bind({});
Standard.args = {
  brandColor: '#770BD6',
  draggable: true,
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzMiAzMiIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQogPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNzcwQkQ2Ii8+DQogPGcgZmlsbD0iI2ZmZiI+DQogIDxwYXRoIGQ9Ik02Ljc2MywxMy42ODV2LTMuMjA4QzYuNzYzLDguNzQ4LDcuNzYyLDgsMTAsOHYxLjA3Yy0xLDAtMiwwLjMyNS0yLDEuNDA3djMuMTg4ICAgIEM4LDE0LjgzNiw2LjUxMiwxNiw1LjUxMiwxNkM2LjUxMiwxNiw4LDE3LjE2NCw4LDE4LjMzNVYyMS41YzAsMS4wODIsMSwxLjQyOSwyLDEuNDI5VjI0Yy0yLjIzOCwwLTMuMjM4LTAuNzcyLTMuMjM4LTIuNXYtMy4xNjUgICAgYzAtMS4xNDktMC44OTMtMS41MjktMS43NjMtMS41ODV2LTEuNUM1Ljg3LDE1LjE5NCw2Ljc2MywxNC44MzQsNi43NjMsMTMuNjg1eiIvPg0KICA8cGF0aCBkPSJtMjUuMjM4IDEzLjY4NXYtMy4yMDhjMC0xLjcyOS0xLTIuNDc3LTMuMjM4LTIuNDc3djEuMDdjMSAwIDIgMC4zMjUgMiAxLjQwN3YzLjE4OGMwIDEuMTcxIDEuNDg4IDIuMzM1IDIuNDg4IDIuMzM1LTEgMC0yLjQ4OCAxLjE2NC0yLjQ4OCAyLjMzNXYzLjE2NWMwIDEuMDgyLTEgMS40MjktMiAxLjQyOXYxLjA3MWMyLjIzOCAwIDMuMjM4LTAuNzcyIDMuMjM4LTIuNXYtMy4xNjVjMC0xLjE0OSAwLjg5My0xLjUyOSAxLjc2Mi0xLjU4NXYtMS41Yy0wLjg3LTAuMDU2LTEuNzYyLTAuNDE2LTEuNzYyLTEuNTY1eiIvPg0KICA8cGF0aCBkPSJtMTUuODE1IDE2LjUxMmwtMC4yNDItMC42NDFjLTAuMTc3LTAuNDUzLTAuMjczLTAuNjk4LTAuMjg5LTAuNzM0bC0wLjM3NS0wLjgzNmMtMC4yNjYtMC41OTktMC41MjEtMC44OTgtMC43NjYtMC44OTgtMC4zNyAwLTAuNjYyIDAuMzQ3LTAuODc1IDEuMDM5LTAuMTU2LTAuMDU3LTAuMjM0LTAuMTQxLTAuMjM0LTAuMjUgMC0wLjMyMyAwLjE4OC0wLjY5MiAwLjU2Mi0xLjEwOSAwLjM3NS0wLjQxNyAwLjcxLTAuNjI1IDEuMDA3LTAuNjI1IDAuNTgzIDAgMS4xODYgMC44MzkgMS44MTEgMi41MTZsMC4xNjEgMC40MTQgMC4xOC0wLjI4OWMxLjEwOC0xLjc2IDIuMDQ0LTIuNjQxIDIuODA0LTIuNjQxIDAuMTk4IDAgMC40MyAwLjA1OCAwLjY5NSAwLjE3MmwtMC45NDYgMC45OTJjLTAuMTI1LTAuMDM2LTAuMjE0LTAuMDU1LTAuMjY2LTAuMDU1LTAuNTczIDAtMS4yNTYgMC42NTktMi4wNDggMS45NzdsLTAuMjI3IDAuMzc5IDAuMTc5IDAuNDhjMC42ODQgMS44OTEgMS4yNDkgMi44MzYgMS42OTQgMi44MzYgMC40MDggMCAwLjcyLTAuMjkyIDAuOTM1LTAuODc1IDAuMTQ2IDAuMDk0IDAuMjE5IDAuMTkgMC4yMTkgMC4yODkgMCAwLjI2MS0wLjIwOCAwLjU3My0wLjYyNSAwLjkzOHMtMC43NzYgMC41NDctMS4wNzggMC41NDdjLTAuNjA0IDAtMS4yMjEtMC44NTItMS44NTEtMi41NTVsLTAuMjE5LTAuNTc4LTAuMjI3IDAuMzk4Yy0xLjA2MiAxLjgyMy0yLjA3OCAyLjczNC0zLjA0NyAyLjczNC0wLjM2NSAwLTAuNjc1LTAuMDkxLTAuOTMtMC4yNzFsMC45MDYtMC44ODVjMC4xNTYgMC4xNTYgMC4zMzggMC4yMzQgMC41NDcgMC4yMzQgMC41ODggMCAxLjI1LTAuNTk2IDEuOTg0LTEuNzg2bDAuNDA2LTAuNjU4IDAuMTU1LTAuMjU5eiIvPg0KICA8ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCguMDUzNiAtLjk5ODYgLjk5ODYgLjA1MzYgNS40OTI1IDMyLjI0NSkiIGN4PSIxOS43NTciIGN5PSIxMy4yMjUiIHJ4PSIuNzc4IiByeT0iLjc3OCIvPg0KICA8ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCguMDUzNiAtLjk5ODYgLjk5ODYgLjA1MzYgLTcuNTgzOSAzMC42MjkpIiBjeD0iMTIuMzY2IiBjeT0iMTkuMzE1IiByeD0iLjc3OCIgcnk9Ii43NzgiLz4NCiA8L2c+DQo8L3N2Zz4NCg==',
  title: 'Increment variable',
};

export const ContextMenu = Template.bind({});
ContextMenu.args = {
  ...Standard.args,
  contextMenuOptions: [
    {
      disabled: false,
      iconName: 'Delete',
      key: 'Delete',
      title: 'Delete',
      type: MenuItemType.Normal,
      onClick() {
        console.log('Delete clicked');
      },
    },
  ],
};

export const Footer = Template.bind({});
Footer.args = {
  ...Standard.args,
  commentBox: {
    brandColor: '#474747',
    comment: 'This is a comment.',
    isDismissed: false,
    isEditing: false,
  },
  connectionDisplayName: 'joechung@microsoft.com',
  connectionRequired: true,
  staticResultsEnabled: true,
};

export const Error = Template.bind({});
Error.args = {
  ...Standard.args,
  draggable: false,
  commentBox: {
    brandColor: '#474747',
    comment: 'This is a comment.',
    isDismissed: false,
    isEditing: false,
  },
  errorLevel: MessageBarType.severeWarning,
  errorMessage: 'This is an error card',
  connectionDisplayName: 'joechung@microsoft.com',
  connectionRequired: true,
  staticResultsEnabled: true,
};

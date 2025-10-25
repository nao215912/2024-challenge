import type { Meta, StoryObj } from '@storybook/vue3';
import GameHeader from './GameHeader.vue';

const meta = {
  title: 'Game/GameHeader',
  component: GameHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ゲームのヘッダーコンポーネント。タイトルとスコア表示を担当します。',
      },
    },
  },
  argTypes: {
    score: {
      control: { type: 'number' },
      description: '現在のスコア',
    },
    bestScore: {
      control: { type: 'number' },
      description: 'ベストスコア',
    },
  },
} satisfies Meta<typeof GameHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    score: 0,
    bestScore: 0,
  },
};

export const WithScore: Story = {
  args: {
    score: 1234,
    bestScore: 5678,
  },
};

export const HighScore: Story = {
  args: {
    score: 12345,
    bestScore: 99999,
  },
};

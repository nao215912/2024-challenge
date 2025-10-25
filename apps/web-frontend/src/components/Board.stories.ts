import type { Meta, StoryObj } from '@storybook/vue3';
import Board from './Board.vue';

const meta = {
  title: 'Game/Board',
  component: Board,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '2048 ゲームボードコンポーネント。4×4のグリッドでタイルを操作して2048を目指します。',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'number', min: 3, max: 6 },
      description: 'ボードのサイズ（size × size のグリッド）',
      table: {
        defaultValue: { summary: 4 },
      },
    },
  },
} satisfies Meta<typeof Board>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトの4×4ボード
 */
export const Default: Story = {
  args: {
    size: 4,
  },
  parameters: {
    docs: {
      description: {
        story: '標準的な4×4のゲームボード。矢印キーまたはスワイプで操作できます。',
      },
    },
  },
};

/**
 * 3×3ボード（簡単モード）
 */
export const Small: Story = {
  args: {
    size: 3,
  },
  parameters: {
    docs: {
      description: {
        story: '3×3の小さいボードで、より簡単にプレイできます。',
      },
    },
  },
};

/**
 * 5×5ボード（難しいモード）
 */
export const Large: Story = {
  args: {
    size: 5,
  },
  parameters: {
    docs: {
      description: {
        story: '5×5の大きいボードで、より複雑なゲームが楽しめます。',
      },
    },
  },
};

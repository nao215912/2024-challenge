import type { Meta, StoryObj } from '@storybook/vue3';
import GameView from './GameView.vue';

const meta = {
  title: 'Views/GameView',
  component: GameView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '2048ゲームの完全なビュー。全てのコンポーネントを組み合わせた完成形です。',
      },
    },
  },
} satisfies Meta<typeof GameView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 完全なゲーム画面
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'ゲームの完全な画面。矢印キーまたはスワイプで操作できます。',
      },
    },
  },
};

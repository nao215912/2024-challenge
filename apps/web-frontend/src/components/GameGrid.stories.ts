import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import GameGrid from './GameGrid.vue';
import { Tile } from '@/game';

const meta = {
  title: 'Game/GameGrid',
  component: GameGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ゲームグリッドコンポーネント。タイルの配置、アニメーション、スワイプ操作を担当します。',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'number', min: 2, max: 6 },
      description: 'グリッドのサイズ（size × size）',
      table: {
        defaultValue: { summary: '4' },
      },
    },
    gameOver: {
      control: 'boolean',
      description: 'ゲームオーバー状態',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof GameGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 空のグリッド
 */
export const Empty: Story = {
  args: {
    tiles: [],
    size: 4,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'タイルがない状態の空のグリッド。背景のセルのみが表示されます。',
      },
    },
  },
};

/**
 * 初期状態（タイル2つ）
 */
export const Initial: Story = {
  args: {
    tiles: [
      new Tile(1, 2, { row: 0, col: 0 }),
      new Tile(2, 2, { row: 2, col: 3 }),
    ],
    size: 4,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'ゲーム開始時の典型的な状態。2つのタイル（値2）がランダムな位置に配置されます。',
      },
    },
  },
};

/**
 * 複数のタイル
 */
export const MultipleTiles: Story = {
  args: {
    tiles: [
      new Tile(1, 2, { row: 0, col: 0 }),
      new Tile(2, 4, { row: 0, col: 1 }),
      new Tile(3, 8, { row: 0, col: 2 }),
      new Tile(4, 16, { row: 0, col: 3 }),
      new Tile(5, 32, { row: 1, col: 0 }),
      new Tile(6, 64, { row: 1, col: 1 }),
      new Tile(7, 128, { row: 1, col: 2 }),
      new Tile(8, 256, { row: 1, col: 3 }),
    ],
    size: 4,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: '複数のタイルが配置された状態。異なる値のタイルの色分けを確認できます。',
      },
    },
  },
};

/**
 * 大きな値のタイル
 */
export const LargeValues: Story = {
  args: {
    tiles: [
      new Tile(1, 512, { row: 0, col: 0 }),
      new Tile(2, 1024, { row: 0, col: 1 }),
      new Tile(3, 2048, { row: 1, col: 0 }),
      new Tile(4, 4096, { row: 1, col: 1 }),
    ],
    size: 4,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: '大きな値のタイル。フォントサイズの調整やカラーリングを確認できます。',
      },
    },
  },
};

/**
 * 新規タイルのアニメーション
 */
export const NewTileAnimation: Story = {
  render: (args) => ({
    components: { GameGrid },
    setup() {
      const tiles = ref([
        new Tile(1, 2, { row: 0, col: 0 }),
        new Tile(2, 2, { row: 1, col: 1 }),
      ]);

      const addNewTile = () => {
        const newTile = new Tile(
          Date.now(),
          2,
          { row: 2, col: 2 }
        );
        newTile.markAsNew();
        tiles.value.push(newTile);
      };

      return { tiles, addNewTile, size: args.size ?? 4, gameOver: args.gameOver ?? false };
    },
    template: `
      <div class="space-y-4">
        <GameGrid :tiles="tiles" :size="size" :gameOver="gameOver" />
        <button
          @click="addNewTile"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新しいタイルを追加
        </button>
      </div>
    `,
  }),
  args: {
    tiles: [],
    size: 4,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'ボタンをクリックして新規タイルのポップインアニメーションを確認できます。',
      },
    },
  },
};

/**
 * マージアニメーション
 */
export const MergeAnimation: Story = {
  render: (args) => ({
    components: { GameGrid },
    setup() {
      const tiles = ref([
        new Tile(1, 2, { row: 0, col: 0 }),
        new Tile(2, 2, { row: 0, col: 1 }),
      ]);

      const triggerMerge = () => {
        // タイルを移動してマージ
        const firstTile = tiles.value[1];
        if (firstTile) {
          firstTile.moveTo({ row: 0, col: 0 });
        }
        const mergedTile = new Tile(3, 4, { row: 0, col: 0 });
        mergedTile.markMerged();
        tiles.value = [mergedTile];
      };

      return { tiles, triggerMerge, size: args.size ?? 4, gameOver: args.gameOver ?? false };
    },
    template: `
      <div class="space-y-4">
        <GameGrid :tiles="tiles" :size="size" :gameOver="gameOver" />
        <button
          @click="triggerMerge"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          マージアニメーションを実行
        </button>
      </div>
    `,
  }),
  args: {
    tiles: [],
    size: 4,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'ボタンをクリックしてタイルのマージ（バウンス）アニメーションを確認できます。',
      },
    },
  },
};

/**
 * 移動アニメーション
 */
export const MoveAnimation: Story = {
  render: (args) => ({
    components: { GameGrid },
    setup() {
      const tiles = ref([
        new Tile(1, 2, { row: 0, col: 0 }),
        new Tile(2, 4, { row: 3, col: 3 }),
      ]);

      const moveRight = () => {
        tiles.value.forEach(tile => {
          if (tile.col < 3) {
            tile.moveTo({ row: tile.row, col: tile.col + 1 });
          }
        });
        tiles.value = [...tiles.value];
      };

      const moveDown = () => {
        tiles.value.forEach(tile => {
          if (tile.row < 3) {
            tile.moveTo({ row: tile.row + 1, col: tile.col });
          }
        });
        tiles.value = [...tiles.value];
      };

      const reset = () => {
        tiles.value = [
          new Tile(1, 2, { row: 0, col: 0 }),
          new Tile(2, 4, { row: 3, col: 3 }),
        ];
      };

      return { tiles, moveRight, moveDown, reset, size: args.size ?? 4, gameOver: args.gameOver ?? false };
    },
    template: `
      <div class="space-y-4">
        <GameGrid :tiles="tiles" :size="size" :gameOver="gameOver" />
        <div class="flex gap-2">
          <button
            @click="moveRight"
            class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            右に移動
          </button>
          <button
            @click="moveDown"
            class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            下に移動
          </button>
          <button
            @click="reset"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            リセット
          </button>
        </div>
      </div>
    `,
  }),
  args: {
    tiles: [],
    size: 4,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'ボタンをクリックしてタイルの移動アニメーションを確認できます。',
      },
    },
  },
};

/**
 * ゲームオーバー状態
 */
export const GameOver: Story = {
  args: {
    tiles: [
      new Tile(1, 2, { row: 0, col: 0 }),
      new Tile(2, 4, { row: 0, col: 1 }),
      new Tile(3, 2, { row: 0, col: 2 }),
      new Tile(4, 4, { row: 0, col: 3 }),
      new Tile(5, 4, { row: 1, col: 0 }),
      new Tile(6, 2, { row: 1, col: 1 }),
      new Tile(7, 4, { row: 1, col: 2 }),
      new Tile(8, 2, { row: 1, col: 3 }),
      new Tile(9, 2, { row: 2, col: 0 }),
      new Tile(10, 4, { row: 2, col: 1 }),
      new Tile(11, 2, { row: 2, col: 2 }),
      new Tile(12, 4, { row: 2, col: 3 }),
      new Tile(13, 4, { row: 3, col: 0 }),
      new Tile(14, 2, { row: 3, col: 1 }),
      new Tile(15, 4, { row: 3, col: 2 }),
      new Tile(16, 2, { row: 3, col: 3 }),
    ],
    size: 4,
    gameOver: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'ゲームオーバー状態。オーバーレイとリトライボタンが表示されます。',
      },
    },
  },
};

/**
 * 3×3グリッド
 */
export const SmallGrid: Story = {
  args: {
    tiles: [
      new Tile(1, 2, { row: 0, col: 0 }),
      new Tile(2, 4, { row: 1, col: 1 }),
      new Tile(3, 8, { row: 2, col: 2 }),
    ],
    size: 3,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: '小さい3×3グリッド。サイズに応じてレイアウトが調整されます。',
      },
    },
  },
};

/**
 * 5×5グリッド
 */
export const LargeGrid: Story = {
  args: {
    tiles: [
      new Tile(1, 2, { row: 0, col: 0 }),
      new Tile(2, 4, { row: 1, col: 1 }),
      new Tile(3, 8, { row: 2, col: 2 }),
      new Tile(4, 16, { row: 3, col: 3 }),
      new Tile(5, 32, { row: 4, col: 4 }),
    ],
    size: 5,
    gameOver: false,
  },
  parameters: {
    docs: {
      description: {
        story: '大きい5×5グリッド。サイズに応じてレイアウトが調整されます。',
      },
    },
  },
};

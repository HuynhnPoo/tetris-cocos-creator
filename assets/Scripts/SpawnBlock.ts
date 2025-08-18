import { _decorator, Component, find, instantiate, Node, Prefab, resources, Sprite, UITransform } from "cc";
import { GameManager } from "./Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("SpawnBlock")
export class SpawnBlock extends Component {
  @property({ type: Prefab })
  private blocks: Prefab[] = [];
  @property({ type: Prefab })
  private nextBlock: Prefab | null = null;

  nextIndex: number = -1;
  private isLoaded: boolean = false;
  @property({ type: Node })
  private nextBlockNodeUI: Node[] = [];

  @property({ type: Sprite })
  private nextBlockNodeSprite: Sprite = null;

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }

  public setIsLoaded(isLoaded: boolean): void {
    this.isLoaded = isLoaded;
  }
  protected onEnable(): void {
    this.LoadBlocks();
  }

  private LoadBlocks(): void {
    resources.loadDir("/block", Prefab, (err, prefabs) => {
      if (err) {
        console.error("Failed to load blocks:", err);
        return;
      }

      // Add validation
      if (!prefabs || prefabs.length === 0) {
        console.error("No prefabs found in /block directory");
        return;
      }

      console.log("Loaded prefabs:", prefabs.length);

      this.blocks = prefabs;
      this.isLoaded = true;
      this.setNextBlock();
    });

    this.nextBlockNodeUI = find("Canvas/shape").children;
  }

  setNextBlock(): void {
    const index = Math.floor(Math.random() * this.blocks.length);
    this.nextBlock = this.blocks[index];

    for (const element of this.nextBlockNodeUI) {
      if (element.name == this.nextBlock.name) {
        this.nextBlockNodeSprite.spriteFrame = element.getComponent(Sprite).spriteFrame;
        this.nextBlockNodeSprite.getComponent(UITransform).setContentSize(40,36);
      }
    }
  }
  update(deltaTime: number) {}

  public spawnBLock(): void {
    // Add additional validation
    const selectedPrefab = this.nextBlock;

    if (!selectedPrefab) {
      console.error("Selected prefab is null/undefined at index:", selectedPrefab);
      return;
    }

    const gameManager = GameManager.getInstance();
    const width = gameManager.getWidth();
    const height = gameManager.getHeight();
    const cellSize = gameManager.getCellSize();

    // Spawn tại grid coordinate center top
    const blockPrefabs = instantiate(selectedPrefab);
    const gridX = 12; // Should be 5 for width=10
    const gridY = 30; // Top row

    blockPrefabs.setPosition(gridX * cellSize - (width * cellSize) / 2, gridY * cellSize - (height * cellSize) / 2);
    // Use EXACT same formula as initGrid()
    this.node.addChild(blockPrefabs);
    gameManager.setCurrentTetromino(blockPrefabs);

    this.setNextBlock(); // Set the next block for the next spawn
  }
}

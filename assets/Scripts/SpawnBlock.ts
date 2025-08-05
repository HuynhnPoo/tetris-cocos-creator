import { _decorator, Component, instantiate, Prefab, resources } from "cc";
import { GameManager } from "./Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("SpawnBlock")
export class SpawnBlock extends Component {
  @property({ type: Prefab })
  private blocks: Prefab[] = [];
  public firstSpawn: boolean = false;
  private blocksLoaded: boolean = false; // Add this flag
 
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
      this.blocksLoaded = true; // Set flag when loading is complete
      this.firstSpawn = true;
    });
  }

  start() {
   
  }

  update(deltaTime: number) {}

  public spawnBLock() {
    // Check if blocks are loaded before spawning
    if (!this.blocksLoaded || !this.blocks || this.blocks.length === 0) {
      console.warn("Blocks not loaded yet or empty blocks array");
      return;
    }

    this.firstSpawn = false;
    const randomIndex = Math.floor(Math.random() * this.blocks.length);
    
    // Add additional validation
    const selectedPrefab = this.blocks[randomIndex];
    if (!selectedPrefab) {
      console.error("Selected prefab is null/undefined at index:", randomIndex);
      return;
    }

    const gameManager = GameManager.getInstance();
    const width = gameManager.getWidth();
    const height = gameManager.getHeight();
    
    // Spawn tại grid coordinate center top
    const blockPrefabs = instantiate(selectedPrefab);
    const gridX = Math.floor(width / 2); // Should be 5 for width=10
    const gridY = 0; // Top row
    
   
    // Use EXACT same formula as initGrid()    
    this.node.addChild(blockPrefabs);
    gameManager.setCurrentTetromino(blockPrefabs);
     }
}
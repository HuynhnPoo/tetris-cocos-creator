import { _decorator, Component, Node, Sprite, SpriteFrame, Color, Vec3, v2, Vec2, math, sp, find, isValid } from "cc";
import { SpawnBlock } from "../SpawnBlock";
import { StringName } from "./StringName";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  private static instance: GameManager | null = null;
  public static getInstance(): GameManager {
    return GameManager.instance;
  }

  @property({ type: SpawnBlock })
  private spawnBlock: SpawnBlock = null;

  @property({ type: Node, visible: true })
  private grid: Node[][] = [];

  @property({ type: Node })
  private currentTetromino: Node = null;

  @property({ type: SpriteFrame, visible: true })
  private cellSpriteFrame: SpriteFrame | null = null;

  private width: number = 10;
  private height: number = 20;
  private cellSize: number = 34;

  private gameStarted: boolean = false;

  public getWidth(): number {
    return this.width;
  }
  public getHeight(): number {
    return this.height;
  }

  public setCurrentTetromino(tetromino: Node): void {
    this.currentTetromino = tetromino;
    console.log("Current tetromino set:", tetromino ? tetromino.name : "null");
  }

  public getCurrentTetromino(): Node {
    return this.currentTetromino;
  }

  public isGameStarted(): boolean {
    return this.gameStarted;
  }

  protected onEnable(): void {
    if (GameManager.instance !== null && GameManager.instance !== this) {
      GameManager.instance.destroy();
    }
    GameManager.instance = this;

    if (this.spawnBlock != null) return;
    this.spawnBlock = find(StringName.spawnBlock).getComponent(SpawnBlock);

    this.initGrid();
  }

  protected start(): void {}

  initGrid(): void {
    this.grid = [];
    for (let i = 0; i < this.height; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.width; j++) {
        // Tạo Node mới
        this.grid[i][j] = new Node(`Cell_${i}_${j}`);

        // Thêm Sprite component để có thể nhìn thấy
        // const sprite = this.grid[i][j].addComponent(Sprite);
        // if (this.cellSpriteFrame) {
        //   sprite.spriteFrame = this.cellSpriteFrame;
        // } else {
        //   sprite.color = new Color(50, 50, 50, 100);
        // }

        // // Đặt kích thước cho sprite
        // this.grid[i][j].getComponent(Sprite).sizeMode = Sprite.SizeMode.CUSTOM;

        //this.grid[i][j].setContentSize(this.cellSize - 2, this.cellSize - 2); // ← DÒNG NÀY BỊ THIẾU

        // Đặt vị trí cho Node (căn giữa lưới)
        this.grid[i][j].setPosition(
          j * this.cellSize - (this.width * this.cellSize) / 2 + this.cellSize / 2,
          -i * this.cellSize + (this.height * this.cellSize) / 2 - this.cellSize / 2,
          0
        );

        // Thêm Node vào scene
        this.node.addChild(this.grid[i][j]);
      }
    }
  }

  isValidPosition(tetromino: Node): boolean {
    if (!isValid(tetromino)) {
      console.warn("Tetromino không hợp lệ:", tetromino);
      return false; // Tetromino không hợp lệ
    }

    for (let i = 0; i < tetromino.children.length; i++) {
      const block = tetromino.children[i];
      const worldPos = block.worldPosition;
      const localPos = this.node.inverseTransformPoint(new Vec3(), worldPos);

      console.log(`Block ${i} world position: ${worldPos}, local position: ${localPos}`);

      const col = Math.floor((localPos.x + (this.width * this.cellSize) / 2) / this.cellSize);
      const row = Math.floor((-localPos.y + (this.height * this.cellSize) / 2) / this.cellSize);

      if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
        //console.log(`Block at (${row}, ${col}) is out of bounds.`);
        return false; // Out of bounds
      }
      if (this.grid[row] && this.grid[row][col] && this.grid[row][col].children.length > 0) {
        console.log(`Block at (${row}, ${col}) overlaps with existing block.`);
        return false; // Overlaps with an existing block
      }
    }
    return true;
  }

  lockTetromino(): void {
    if (!isValid(this.currentTetromino)) {
      console.warn("No current tetromino to lock.");
      return;
    }

    // Chỉ cần đánh dấu tetromino này là đã "locked"
    // Không destroy, không di chuyển vị trí

    // Có thể thêm một property để đánh dấu tetromino đã bị khóa
    // Ví dụ: thêm một tag hoặc userData
    this.currentTetromino.userData = { locked: true };

    console.log("Tetromino locked at position:", this.currentTetromino.position);

    // Reset current tetromino để spawn tetromino mới
    this.currentTetromino = null;

    // Spawn tetromino mới (nếu cần)
    // if (this.spawnBlock) {
    //   this.spawnBlock.spawnNewTetromino(); // Giả sử bạn có method này
    // }
  }
  //Cập nhật hàm moveBlock để kiểm tra tetromino đã bị lock chưa
  moveBlock(direction: Vec3): void {
    if (!isValid(this.currentTetromino)) {
      console.warn("No current tetromino to move.");
      return;
    }

    // Kiểm tra xem tetromino đã bị lock chưa
    if (this.currentTetromino.userData && this.currentTetromino.userData.locked) {
      console.log("Tetromino is locked, cannot move.");
      return;
    }

    const originalPosition = this.currentTetromino.position.clone();

    // Calculate the potential new position
    const newPosition = originalPosition.add(direction);
    this.currentTetromino.setPosition(newPosition);

    // Check if the new position is valid
    if (this.isValidPosition(this.currentTetromino)) {
      console.log("Tetromino di chuyen hop le:", this.currentTetromino.position);
    } else {
      // Đưa về vị trí cũ
      this.currentTetromino.setPosition(originalPosition);

      // Lock tetromino tại vị trí hiện tại
      this.lockTetromino();
    }
  }
  rotateBlock(): void {
    if (!isValid(this.currentTetromino)) {
      console.warn("No current tetromino to rotate.");
      return;
    }
    // Lưu góc xoay gốc (đúng tên biến)
    const originalAngle = this.currentTetromino.angle;

    // Xoay tetromino
    this.currentTetromino.angle += 90;

    // Kiểm tra vị trí sau khi xoay (SỬA LOGIC CHÍNH)
    if (this.isValidPosition(this.currentTetromino)) {
      console.log("Tetromino xoay hop le");
    } else {
      // Reset về góc xoay cũ
      this.currentTetromino.angle = originalAngle;
      console.log("Khong the xoay tetromino");
      // KHÔNG lock khi không xoay được!
    }
  }
}

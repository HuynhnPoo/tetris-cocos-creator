import {
  _decorator,
  Component,
  Node,
  Sprite,
  SpriteFrame,
  Vec3,
  find,
  isValid,
  UITransform,
  Color,
  size,
  director,
} from "cc";
import { SpawnBlock } from "../SpawnBlock";
import { StringName } from "./StringName";
import { Score } from "./Score";
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

  private isStartedGame: boolean = false;

  public score: Score = new Score();
  public getWidth(): number {
    return this.width;
  }
  public getHeight(): number {
    return this.height;
  }

  public getCellSize() {
    return this.cellSize;
  }
  public setCurrentTetromino(tetromino: Node): void {
    this.currentTetromino = tetromino;
  }

  public getCurrentTetromino(): Node {
    return this.currentTetromino;
  }

  protected onEnable(): void {
    if (GameManager.instance !== null && GameManager.instance !== this) {
      this.node.destroy();
      return;
    }
    GameManager.instance = this;
    // Quan trọng: Làm cho Node này bền bỉ giữa các cảnh

    if (this.spawnBlock != null) return;
    this.spawnBlock = find(StringName.spawnBlock).getComponent(SpawnBlock);

    this.initGrid();
    this.spawnBlock.setIsLoaded(false);
    this.isStartedGame = false;
  }

  protected start(): void {
    //  this.spawnBlock.spawnBLock();
  }

  protected update(dt: number): void {
    console.log("GameManager ", this.spawnBlock.getIsLoaded(), "isStartedGame:", this.isStartedGame);
    if (this.spawnBlock.getIsLoaded() && !this.isStartedGame) {
      this.spawnBlock.spawnBLock();
      this.isStartedGame = true;
    }
  }

  initGrid(): void {
    
    this.grid = [];
    for (let i = 0; i < this.height; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.width; j++) {
        // Tạo Node mới
        this.grid[i][j] = new Node(`Cell_${i}_${j}`);

        const sprite = this.grid[i][j].addComponent(Sprite);

        // Thêm Sprite component để có thể nhìn thấy
        // this.grid[i][j].addComponent(Sprite);
        // if (this.cellSpriteFrame) {
        //   sprite.spriteFrame = this.cellSpriteFrame;
        // } else {
        //   sprite.color = new Color(50, 50, 50, 100);
        // }

        // Đặt kích thước cho sprite
        this.grid[i][j].getComponent(Sprite).sizeMode = Sprite.SizeMode.CUSTOM;

        this.grid[i][j].getComponent(UITransform).setContentSize(this.cellSize - 2, this.cellSize - 2); // ← DÒNG NÀY BỊ THIẾU

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

      //console.log(`Block ${i} world position: ${worldPos}, local position: ${localPos}`);

      const col = Math.floor((localPos.x + (this.width * this.cellSize) / 2) / this.cellSize);
      const row = Math.floor((-localPos.y + (this.height * this.cellSize) / 2) / this.cellSize);

      if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
        //console.log(`Block at (${row}, ${col}) is out of bounds.`);
        return false; // Out of bounds
      }
      if (this.grid[row] && this.grid[row][col] && this.grid[row][col].children.length > 0) {
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

    const blocksToLock = [...this.currentTetromino.children];

    for (let i = 0; i < blocksToLock.length; i++) {
      const block = blocksToLock[i];

      const worldPos = block.worldPosition.clone();
      const localPos = this.node.inverseTransformPoint(new Vec3(), worldPos);

      const col = Math.floor((localPos.x + (this.width * this.cellSize) / 2) / this.cellSize);
      const row = Math.floor((-localPos.y + (this.height * this.cellSize) / 2) / this.cellSize);
      if (row >= 0 && row < this.height && col >= 0 && col < this.width) {
        block.removeFromParent();

        this.grid[row][col].addChild(block); // gắn vào grid
        //console.log("objetc them con là:", this.grid[row][col].name);
        block.setWorldPosition(worldPos); // canh giữa cell
      }
    }
    this.checkClearRows();

    // Kiểm tra và xóa hàng đầy
    this.currentTetromino = null;
  }
  public hardDrop(): void {
    if (!isValid(this.currentTetromino)) {
      console.warn("No current tetromino to move.");
      return;
    }

    let isDrop = true;
    while (isDrop) {
      const originalPosition = this.currentTetromino.position.clone();

      this.currentTetromino.setPosition(originalPosition.clone().add(new Vec3(0, -this.getCellSize(), 0)));

      if (!this.isValidPosition(this.currentTetromino)) {
        this.score.addScore(10); // Cộng điểm khi hard drop
        this.currentTetromino.setPosition(originalPosition); // Đưa về vị trí cũ
        this.lockTetromino();
        this.spawnBlock.spawnBLock(); // Tạo tetromino mới
        isDrop = false; // Dừng vòng lặp
      }
    }
  }

  //Cập nhật hàm moveBlock để kiểm tra tetromino đã bị lock chưa
  public moveBlock(direction: Vec3): void {
    if (!isValid(this.currentTetromino)) {
      console.warn("No current tetromino to move.");
      return;
    }

    const originalPosition = this.currentTetromino.position.clone();

    // QUAN TRỌNG: Tạo Vec3 mới thay vì sử dụng tham chiếu
    //const moveDirection = new Vec3(direction.x, direction.y, direction.z);
    const newPosition = originalPosition.clone().add(direction);

    this.currentTetromino.setPosition(newPosition);

    // Check if the new position is valid
    if (this.isValidPosition(this.currentTetromino)) {
      // console.log("Tetromino di chuyen hop le:", this.currentTetromino.position);
    } else {
      // Đưa về vị trí cũ
      this.currentTetromino.setPosition(originalPosition);

      if (direction.y < 0) {
        this.lockTetromino();

        this.spawnBlock.spawnBLock();
      }
    }
  }

  public rotateBlock(): void {
    if (!isValid(this.currentTetromino)) {
      console.warn("No current tetromino to rotate.");
      return;
    }

    // Kiểm tra vị trí sau khi xoay (SỬA LOGIC CHÍNH)
    this.currentTetromino.angle -= 90;
    if (!this.isValidPosition(this.currentTetromino)) this.currentTetromino.angle += 90;
  }

  public checkClearRows(): void {
    // CÁCH 1: Đơn giản - kiểm tra từ dưới lên, không thay đổi row trong vòng lặp
    let row = this.height - 1;
    let safety = 0; // biến chống vòng lặp vô hạn để debug
    while (row >= 0) {
      if (this.isLineFull(row)) {
        this.clearRow(row);
        this.shiftRowsDown(row);
        row--;
        safety++;
        if (safety > 20) {
          // chống loop vô hạn khi debug
          console.warn("Vòng lặp dừng vì safety limit");
          break;
        }
      } else {
        // Chỉ giảm row khi hàng không đầy
        row--;
      }
    }
  }

  // Sửa tên hàm cho đúng
  isLineFull(row: number): boolean {
    if (row < 0 || row >= this.height) {
      return false;
    }

    for (let col = 0; col < this.width; col++) {
      if (this.grid[row][col].children.length === 0) {
        return false; // Nếu có bất kỳ ô nào trống, hàng không đầy
      }
    }
    return true; // Tất cả ô trong hàng đều có block
  }

  public clearRow(row: number): void {
    for (let col = 0; col < this.width; col++) {
      const block = this.grid[row][col].children[0];
      if (block) {
        block.destroy();
      }
    }
  }

  public shiftRowsDown(startRow: number): void {
    for (let row = startRow - 1; row > 0; row--) {
      for (let col = 0; col < this.width; col++) {
        const block = this.grid[row][col].children[0];

        // console.log('hien thi cha block ', block.parent.name);
        if (block) {
          block?.removeFromParent();
          // console.log("hien thi ra block:", block.name, "cha :", block.parent.name);

          this.grid[row + 1][col].addChild(block);
          block.setPosition(5, -10, 0);
        }
      }
    }
  }

  protected onDestroy(): void {
    this.spawnBlock.setIsLoaded(false); // Đặt spawnBlock về trạng thái chưa tải
    this.isStartedGame = false; // Đặt isStartedGame về false khi GameManager bị hủy
    GameManager.instance = null; // Đặt instance về null khi GameManager bị hủy
  }

  gameOver(): void {
    const ss=this.currentTetromino.children[0].position;

  }
}

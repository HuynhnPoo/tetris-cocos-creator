import { _decorator, Component, Input, input, KeyCode, EventKeyboard, Node, game, Vec3, v3 } from "cc";
import { GameManager } from "./Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("MoveBlock")
export class MoveBlock extends Component {
  private pastTime: number = 0;
  private movementFrequency: number = 1;

  start() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  protected update(dt: number): void {
    this.pastTime += dt;
    if (this.pastTime >= this.movementFrequency) {
      this.pastTime = 0;
      GameManager.getInstance().moveBlock(new Vec3(0, -GameManager.getInstance().getCellSize(), 0)); // Di chuyển xuống dưới
    }
  }

  private onKeyDown(event: EventKeyboard) {
    const gameManager = GameManager.getInstance();
    switch (event.keyCode) {
      case KeyCode.KEY_S:
      case KeyCode.ARROW_DOWN:
        gameManager.hardDrop();
        break;
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
        gameManager.moveBlock(new Vec3(-gameManager.getCellSize(), 0, 0));
        break;
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        gameManager.moveBlock(new Vec3(gameManager.getCellSize(), 0, 0));
        break;
      case KeyCode.SPACE:
      case KeyCode.KEY_W:
      case KeyCode.ARROW_UP:
        gameManager.rotateBlock();
        break;
    }
  }

  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }
}

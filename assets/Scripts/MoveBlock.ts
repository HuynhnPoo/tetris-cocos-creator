import { _decorator, Component, Input, input, KeyCode, EventKeyboard, Node, game, Vec3 } from "cc";
import { GameManager } from "./Manager/GameManager";
const { ccclass, property } = _decorator;

@ccclass("MoveBlock")
export class MoveBlock extends Component {
  private pastTime: number = 0;
  private movementFrequency: number = 1; // Thay đổi tốc độ di chuyển tại đây

  private directionX: number = 33;
  private directionY: number = -1;
  start() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  update(deltaTime: number) {
    if (this.pastTime > this.movementFrequency) {
      GameManager.getInstance().moveBlock(new Vec3(0, -35, 0));
      this.pastTime = 0;
    }
    this.pastTime += deltaTime;
  }

  private onKeyDown(event: EventKeyboard) {
    // Check if GameManager exists and game has started before processing input
    const gameManager = GameManager.getInstance();

    switch (event.keyCode) {
      case KeyCode.KEY_S:
      case KeyCode.ARROW_DOWN:
        gameManager.moveBlock(new Vec3(0, -1, 0));
        break;
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
        gameManager.moveBlock(new Vec3(-33, 0, 0));
        break;
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        gameManager.moveBlock(new Vec3(33, 0, 0));
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

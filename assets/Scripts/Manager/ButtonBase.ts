import { __private, _decorator, Button, Component, director, find, Node, Vec3 } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("ButtonBase")
export class ButtonBase extends Component {
  @property({ type: Button })
  button: Button;
  @property({ type: Node })
  pausePanel: Node = null;
  @property
  index: number = 0;

  protected onEnable(): void {
    this.pausePanel = find("Canvas/panel");
  }
  start() {
    if (this.button) {
      console.error("ButtonBase: No Button component found on this node.");
      return;
    }
    this.button = this.node.getComponent(Button);
    this.button.node.on(
      Button.EventType.CLICK,
      () => {
        this.onClick(this.index);
      },
      this
    );
  }

  onClick(index: number) {
    switch (index) {
      case 0:
        GameManager.getInstance().rotateBlock();
        break;
      case 1:
        GameManager.getInstance().moveBlock(new Vec3(-GameManager.getInstance().getCellSize(), 0, 0));
        break;
      case 2:
        GameManager.getInstance().moveBlock(new Vec3(GameManager.getInstance().getCellSize(), 0, 0));
        break;
      case 3:
        GameManager.getInstance().hardDrop();
        break;
      case 4:
        this.pausePanel.active = true;
        director.pause();
        break;
      default:
        console.log("Button clicked: Unknown action");
        break;
    }
  }
}

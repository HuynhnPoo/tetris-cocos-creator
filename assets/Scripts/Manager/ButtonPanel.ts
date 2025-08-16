import { _decorator, Button, Component, director, find, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ButtonPanel")
export class ButtonPanel extends Component {
  @property({ type: Button })
  button: Button;
  @property({ type: Node })
  pausePanel: Node = null;

  @property
  index: number = 0;
  protected onEnable(): void {
    this.pausePanel = find("Canvas/panel");
    
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
      case 5:
        director.resume();
        this.pausePanel.active = false;
        break;
      case 6:
        director.resume();
        director.loadScene("GAMEPLAY");
        console.log('thue hien thi ra index:', index);
        break;
    }
  }

  update(deltaTime: number) {}
}

import { _decorator, Component, Game, game, Label, Node } from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("TextBase")
export class TextBase extends Component {
  @property({ type: Label })
  text: Label = null;
  protected onEnable(): void {
    if (this.text !== null) return;
    this.text = this.node.getComponent(Label);
  }

  update(deltaTime: number) {
    let score = GameManager.getInstance().score.getScore().toString();
    while (score.length <4) {
      score = "0" + score;
    }
    this.text.string = score;
  }
}

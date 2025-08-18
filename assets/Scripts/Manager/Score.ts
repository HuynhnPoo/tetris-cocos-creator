import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Score")
export class Score {
  private score: number = 0;

  public getScore(): number {
    return this.score;
  }

  addScore(score: number): number {
    this.score += score;

    return this.score;
  }
}

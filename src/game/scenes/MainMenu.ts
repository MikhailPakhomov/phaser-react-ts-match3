import { GameObjects, Scene } from "phaser";
import { levelConfigs } from "../levels/levelConfig";
import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;

    logoTween: Phaser.Tweens.Tween | null;

    constructor() {
        super("MainMenu");
    }

    create() {
        const camera = this.cameras.main;
        const centerX = camera.centerX;
        const centerY = camera.centerY;
       
        for (const level of levelConfigs) {
            const startButton = this.add
                .text(centerX, centerY, "▶ Уровень 1", {
                    fontSize: "28px",
                    color: "#ffffff",
                    backgroundColor: "#007acc",
                    padding: { x: 16, y: 8 },
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    
                    this.scene.start("Game", {
                        config: level,
                    });
                });

            startButton.on("pointerover", () =>
                startButton.setStyle({ backgroundColor: "#005fa3" })
            );
            startButton.on("pointerout", () =>
                startButton.setStyle({ backgroundColor: "#007acc" })
            );
        }

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("Game");
    }
}

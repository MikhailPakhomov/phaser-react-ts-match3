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
    
        const cols = 5;
        const rows = 5;
        const cellWidth = 64;
        const cellHeight = 72;
        const spacing =0;
    
        const gridWidth = cols * cellWidth + (cols - 1) * spacing;
        const gridHeight = rows * cellHeight + (rows - 1) * spacing;
    
        const startX = centerX - gridWidth / 2 + cellWidth / 2;
        const startY = centerY - gridHeight / 2 + cellHeight / 2;
    
        levelConfigs.forEach((level, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
    
            const x = startX + col * (cellWidth + spacing);
            const y = startY + row * (cellHeight + spacing);
    
            // Фоновая плитка
            const tile = this.add.sprite(x, y, level.difficult)
                .setDisplaySize(cellWidth, cellHeight)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                    this.scene.start("Game", {
                        config: level,
                    });
                });
    
            // Номер уровня по центру
            const label = this.add.text(x, y, `${level.id}`, {
                fontSize: "24px",
                color: "#ffffff",
                fontStyle: "bold",
            }).setOrigin(0.5);
    
            // Наведение на плитку
            tile.on("pointerover", () => tile.setTint(0xaaaaaa));
            tile.on("pointerout", () => tile.clearTint());
        });
    
        EventBus.emit("current-scene-ready", this);
    }
    
    

    changeScene() {
        this.scene.start("Game");
    }
}

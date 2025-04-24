import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";

export class Onboarding extends Scene {
    private step: number = 0;
    private continueButton!: Phaser.GameObjects.Image;

    constructor() {
        super("Onboarding");
    }

    init(data: { levelId: number }) {
        
    }

    create() {
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const easySprite = this.add.sprite(
            centerX - 75,
            centerY - 285,
            "onboarding_easy"
        );
        easySprite.setOrigin(0.5);
        easySprite.setScale(0.333);

        const mediumSprite = this.add.sprite(
            centerX - 125,
            centerY - 240,
            "onboarding_medium"
        );
        mediumSprite.setOrigin(0.5);
        mediumSprite.setScale(0.333);

        const hardSprite = this.add.sprite(
            centerX - 29,
            centerY - 240,
            "onboarding_hard"
        );
        hardSprite.setOrigin(0.5);
        hardSprite.setScale(0.333);

        const topLeftArrow = this.add.sprite(
            centerX + 90,
            centerY - 230,
            "onboarding_top_left_arrow"
        );
        topLeftArrow.setOrigin(0.5);
        topLeftArrow.setScale(0.333);

        const row1 = this.add.sprite(
            centerX + 60,
            centerY - 110,
            "onboarding_row_1"
        );
        row1.setOrigin(0.5);
        row1.setScale(0.333);

        const topRightArrow = this.add.sprite(
            centerX - 110,
            centerY - 60,
            "onboarding_top_right_arrow"
        );
        topRightArrow.setOrigin(0.5);
        topRightArrow.setScale(0.333);

        const row2 = this.add.sprite(
            centerX - 50,
            centerY + 70,
            "onboarding_row_2"
        );
        row2.setOrigin(0.5);
        row2.setScale(0.333);

        const topTextTitle = this.add
            .text(centerX - 75, centerY - 200, "Уровни", {
                font: "800 18px Nunito",
                color: "#FFFFFF",
                fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setResolution(2);

        const topTextContent = this.add
            .text(centerX - 78, centerY - 180, "Выбери уровень по сложности", {
                font: "600 12px Nunito",
                color: "#FFFFFF",
            })
            .setOrigin(0.5)
            .setResolution(2);

        const midTextTitle = this.add
            .text(centerX + 65, centerY - 60, "Три в ряд", {
                font: "800 18px Nunito",
                color: "#FFFFFF",
            })
            .setOrigin(0.5)
            .setResolution(2);

        const midTextContent = this.add
            .text(
                centerX + 65,
                centerY - 18,
                "Выполни цели на уровне за ограниченное количество ходов, создавая комбинации из трёх и более фишек в ряд",
                {
                    font: "600 12px Nunito",
                    color: "#FFFFFF",
                    align: "center", // выравнивание
                    wordWrap: { width: 220, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(2);

        const bottomTextTitle = this.add
            .text(centerX - 50, centerY + 120, "Награда", {
                font: "800 18px Nunito",
                color: "#FFFFFF",
            })
            .setOrigin(0.5)
            .setResolution(2);

        const bottomTextContent = this.add
            .text(
                centerX - 48,
                centerY + 155,
                "За успешное прохождение уровней откроется часть картинки, а при открытии всей картинки ты получишь приз",
                {
                    font: "600 12px Nunito",
                    color: "#FFFFFF",
                    align: "center", // выравнивание
                    wordWrap: { width: 248, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(2);

        this.continueButton = this.add
            .image(centerX, centerY + 230, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176, 48)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                window.localStorage.setItem(
                    "isFirstLaunch",
                    JSON.stringify(false)
                );
                this.scene.stop("Onboarding");
                this.scene.start("MainMenu", {});
            });

        EventBus.emit("current-scene-ready", this);
    }
}

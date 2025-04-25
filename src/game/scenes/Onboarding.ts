import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";

export class Onboarding extends Scene {
    private step: number = 0;
    private continueButton!: Phaser.GameObjects.Image;

    constructor() {
        super("Onboarding");
    }

    init(data: { levelId: number }) {}

    create() {
        this.game.renderer.config.antialias = true;

        const ctx = this.game.canvas.getContext("2d");
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
        }

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        const topLeftArrow = this.add.sprite(
            centerX + 80,
            centerY - 200,
            "onboarding_top_left_arrow"
        );

        topLeftArrow.setOrigin(0.5);
        topLeftArrow.setScale(0.333);

        const row0 = this.add.sprite(
            centerX - 70,
            centerY - 260,
            "onboarding_row_0"
        );
        row0.setOrigin(0.5);
        row0.setScale(0.333);

        const row1 = this.add.sprite(
            centerX + 70,
            centerY - 80,
            "onboarding_row_1"
        );
        row1.setOrigin(0.5);
        row1.setScale(0.333);

        const topRightArrow = this.add.sprite(
            centerX - 90,
            centerY-10,
            "onboarding_top_right_arrow"
        );
        topRightArrow.setOrigin(0.5);
        topRightArrow.setScale(0.333);

        const row2 = this.add.sprite(
            centerX - 50,
            centerY + 95,
            "onboarding_row_2"
        );
        row2.setOrigin(0.5);
        row2.setScale(0.333);

        const topTextContent = this.add
            .text(
                centerX - 70,
                centerY - 200,
                "Выбери уровень для прохождения",
                {
                    font: "600 12px Nunito",
                    color: "#FFFFFF",
                    align: "center", // выравнивание
                    wordWrap: { width: 120, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(2);

        const midTextContent = this.add
            .text(
                centerX + 75,
                centerY + 10,
                "Собирай «три в ряд» и открывай части пазла",
                {
                    font: "600 12px Nunito",
                    color: "#FFFFFF",
                    align: "center", // выравнивание
                    wordWrap: { width: 135, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(2);



        const bottomTextContent = this.add
            .text(
                centerX - 48,
                centerY + 155,
                "Собери полное изображение",
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

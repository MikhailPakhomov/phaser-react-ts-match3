import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { delayPromise } from "../utils/tween-utils";

const dpr = window.devicePixelRatio || 1;
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
            centerX + 80*dpr,
            centerY - 230*dpr,
            "onboarding_top_left_arrow"
        );

        topLeftArrow.setOrigin(0.5);
        topLeftArrow.setScale(0.333*dpr);

        const row0 = this.add.sprite(
            centerX - 70*dpr,
            centerY - 260*dpr,
            "onboarding_row_0"
        );
        row0.setOrigin(0.5);
        row0.setScale(0.333*dpr);

        const row1 = this.add.sprite(
            centerX + 70*dpr,
            centerY - 80*dpr,
            "onboarding_row_1"
        );
        row1.setOrigin(0.5);
        row1.setScale(0.333*dpr);

        const topRightArrow = this.add.sprite(
            centerX - 90*dpr,
            centerY-10*dpr,
            "onboarding_top_right_arrow"
        );
        topRightArrow.setOrigin(0.5);
        topRightArrow.setScale(0.333*dpr);

        const row2 = this.add.sprite(
            centerX - 50*dpr,
            centerY + 95*dpr,
            "onboarding_row_2"
        );
        row2.setOrigin(0.5);
        row2.setScale(0.333*dpr);

        const topTextContent = this.add
            .text(
                centerX - 70*dpr,
                centerY - 200*dpr,
                "Выбери уровень для прохождения",
                {
                    font: `600 ${12*dpr}px Nunito`,
                    color: "#FFFFFF",
                    align: "center", // выравнивание
                    wordWrap: { width: 120*dpr, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        const midTextContent = this.add
            .text(
                centerX + 75*dpr,
                centerY + 10*dpr,
                "Собирай «три в ряд» и открывай части пазла",
                {
                    font: `600 ${12*dpr}px Nunito`,
                    color: "#FFFFFF",
                    align: "center", // выравнивание
                    wordWrap: { width: 135*dpr, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);



        const bottomTextContent = this.add
            .text(
                centerX - 48*dpr,
                centerY + 155*dpr,
                "Собери полное изображение",
                {
                    font: `600 ${12*dpr}px Nunito`,
                    color: "#FFFFFF",
                    align: "center", // выравнивание
                    wordWrap: { width: 248*dpr, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5)
            .setResolution(dpr < 2 ? 2 : dpr);

        this.continueButton = this.add
            .image(centerX, centerY + 230*dpr, "later_btn")
            .setOrigin(0.5)
            .setDisplaySize(176*dpr, 48*dpr)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                this.sound.add("click").play();
                window.localStorage.setItem(
                    "isFirstLaunch",
                    JSON.stringify(false)
                );
                window.localStorage.setItem(
                    "isShowInfo",
                    JSON.stringify(true)
                );
                this.scene.stop("Onboarding");
                this.scene.start("MainMenu", {});
            });

        EventBus.emit("current-scene-ready", this);
    }
}

import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class PromoInfo extends Scene {
    private step: number = 0;
    private continueButton!: Phaser.GameObjects.Image;

    constructor() {
        super("PromoInfo");
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

        const overlay = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "tutorial_overlay"
        );
        overlay.setDisplaySize(
            this.cameras.main.width + 10,
            this.cameras.main.height + 10
        );
        overlay.setOrigin(0.5);
        overlay.setDepth(100);

        const bgInfo = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 20,
            "info_promo_bg"
        );
        bgInfo.setDisplaySize(300, 512);
        bgInfo.setOrigin(0.5);
        bgInfo.setDepth(1001);

        const close = this.add.image(
            this.cameras.main.centerX + 120,
            this.cameras.main.centerY - 250,
            "close_btn"
        );
        close.setOrigin(0.5);
        close.setDepth(1003);
        close.setInteractive({ useHandCursor: true });
        close.setScale(0.333);
        close.on("pointerdown", () => {
            this.scene.stop("PromoInfo");
            this.scene.start("MainMenu");
        });

        const infoPromoTitle = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 230,
            "Инструкция по активации промокода",
            {
                font: "800 20px Nunito",
                color: "#000000",
                align: "center",
                wordWrap: { width: 252 },
            }
        );
        infoPromoTitle.setOrigin(0.5);
        infoPromoTitle.setDepth(1001);
        infoPromoTitle.setResolution(2);

        const infoPromoText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 70,
            "1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. \n2. Aenean commodo ligula eget dolor. Aenean massa. \n3. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.\n4. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.\n5. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",
            {
                font: "600 16px Nunito",
                color: "#000000",
                wordWrap: { width: 252 },
            }
        );

        infoPromoText.setOrigin(0.5);
        infoPromoText.setDepth(1001);
        infoPromoText.setResolution(2);

        const activateBtn = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 120,
            "activate_btn"
        );

        activateBtn.setOrigin(0.5);
        activateBtn.setDepth(1001);
        activateBtn.setScale(0.333);
        activateBtn.setInteractive({ useHandCursor: true });
        activateBtn.on("pointerdown", () => {
            window.open("https://www.yota.ru/");
        });

        const toMainBtn = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 180,
            "main_menu_btn"
        );
        toMainBtn.setOrigin(0.5);
        toMainBtn.setScale(0.333);
        toMainBtn.setDepth(1001);
        toMainBtn.setInteractive({ useHandCursor: true });
        toMainBtn.on("pointerdown", () => {
            this.scene.stop("PromoInfo");
            this.scene.start("MainMenu");
        });

        EventBus.emit("current-scene-ready", this);
    }
}

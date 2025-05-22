import { Scene } from "phaser";
import { EventBus } from "../EventBus";

const dpr = window.devicePixelRatio || 1;
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
            this.cameras.main.centerY - 20*dpr,
            "info_promo_bg"
        );
        bgInfo.setDisplaySize(300*dpr, 512*dpr);
        bgInfo.setOrigin(0.5);
        bgInfo.setDepth(1001);

        const close = this.add.image(
            this.cameras.main.centerX + 120*dpr,
            this.cameras.main.centerY - 250*dpr,
            "close_btn"
        );
        close.setOrigin(0.5);
        close.setDepth(1003);
        close.setInteractive({ useHandCursor: true });
        close.setScale(0.333*dpr);
        close.on("pointerdown", () => {
            this.sound.add("click").play()
            this.scene.stop("PromoInfo");
            this.scene.resume("MainMenu");
        });

        const infoPromoTitle = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 230*dpr,
            "Инструкция по активации промокода",
            {
                font: `800 ${20*dpr}px Nunito`,
                color: "#000000",
                align: "center",
                wordWrap: { width: 252*dpr },
            }
        );
        infoPromoTitle.setOrigin(0.5);
        infoPromoTitle.setDepth(1001);
        infoPromoTitle.setResolution(dpr < 2 ? 2 : dpr);

        const infoPromoText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 70*dpr,
            "1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. \n2. Aenean commodo ligula eget dolor. Aenean massa. \n3. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.\n4. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.\n5. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.",
            {
                font: `600 ${16*dpr}px Nunito`,
                color: "#000000",
                wordWrap: { width: 252*dpr },
            }
        );

        infoPromoText.setOrigin(0.5);
        infoPromoText.setDepth(1001);
        infoPromoText.setResolution(dpr < 2 ? 2 : dpr);

        const activateBtn = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 120*dpr,
            "activate_btn"
        );

        activateBtn.setOrigin(0.5);
        activateBtn.setDepth(1001);
        activateBtn.setScale(0.333*dpr);
        activateBtn.setInteractive({ useHandCursor: true });
        activateBtn.on("pointerdown", () => {
            this.sound.add("click").play()
            window.open("https://www.yota.ru/");
        });

        const toMainBtn = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 180*dpr,
            "main_menu_btn_blue"
        );
        toMainBtn.setOrigin(0.5);
        toMainBtn.setScale(0.333*dpr);
        toMainBtn.setDepth(1001);
        toMainBtn.setInteractive({ useHandCursor: true });
        toMainBtn.on("pointerdown", () => {
            this.sound.add("click").play()
            this.scene.stop("PromoInfo");
            this.scene.resume("MainMenu");
        });

        EventBus.emit("current-scene-ready", this);
    }
}

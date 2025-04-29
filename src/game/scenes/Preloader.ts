import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        const { width, height } = this.scale;

        const logo = this.add.image(this.cameras.main.centerX, 50, "logo");

        logo.setOrigin(0.5);
        logo.setDepth(10);

        const title = this.add.text(
            this.cameras.main.centerX,
            140,
            "НАЗВАНИЕ ИГРЫ",
            {
                font: "800 56px Nunito",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 325 },
            }
        );
        title.setOrigin(0.5);
        title.setResolution(2);

        const energy = this.add.image(
            this.cameras.main.centerX - 90,
            this.cameras.main.centerY - 30,
            "preloader_energy"
        );
        energy.setOrigin(0.5);
        energy.setScale(0.333);
        energy.setDepth(2);

        const smartphone = this.add.image(
            this.cameras.main.centerX + 55,
            this.cameras.main.centerY + 15,
            "preloader_smartphone"
        );
        smartphone.setOrigin(0.5);
        smartphone.setScale(0.333);
        smartphone.setDepth(2);

        const sim = this.add.image(
            this.cameras.main.centerX - 70,
            this.cameras.main.centerY + 140,
            "preloader_sim"
        );
        sim.setOrigin(0.5);
        sim.setScale(0.333);
        sim.setDepth(2);

        const rays = this.add.image(
            this.cameras.main.centerX + 50,
            this.cameras.main.centerY,
            "win_bg"
        );
        const barBg = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.height - 80,
            "preloader_bar_bg"
        );
        barBg.setOrigin(0.5);
        barBg.setDisplaySize(240, 28);

        const totalBarWidth = 240;
        const barHeight = 28;
        const barRadius = 15;

        const barGraphics = this.add.graphics();
        barGraphics.setDepth(2);

        let currentProgressWidth = 4;

        function drawProgressBar(progress: number) {
            barGraphics.clear();

            barGraphics.fillStyle(0xffffff, 1);

            currentProgressWidth = 4 + totalBarWidth * progress;

            const safeWidth = Math.max(currentProgressWidth, barRadius * 2);

            const barX = width / 2 - totalBarWidth / 2;
            const barY = height - 80 - barHeight / 2;

            barGraphics.fillRoundedRect(
                barX,
                barY,
                safeWidth,
                barHeight,
                barRadius
            );
        }

        const progressText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 80,
            "0%",
            { font: "800 16px Nunito" }
        );
        progressText.setOrigin(0.5);
        progressText.setDepth(3);

        // Подписываемся на событие загрузки
        this.load.on("progress", (progress: number) => {
            const percent = Math.round(progress * 100);
            progressText.setText(`${percent}%`);
            if (percent >= 50) {
                progressText.setColor("#1394db");
            } else {
                progressText.setColor("#dbeeff");
            }
            drawProgressBar(progress);
        });
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("tile_bg", "tile_bg.png");
        this.load.image("phone", "phone.png");
        this.load.image("smartphone", "smartphone.png");
        this.load.image("sim", "sim.png");
        this.load.image("message", "message.png");
        this.load.image("energy", "energy.png");
        this.load.image("discoball", "discoball.png");
        this.load.image("ice_full", "ice_full.png");
        this.load.image("ice_cracked", "ice_cracked.png");
        this.load.image("box_full", "box_full.png");
        this.load.image("box_cracked", "box_cracked.png");
        this.load.image("rocket", "rocket.png");
        this.load.image("moves_bg", "moves_bg.png");
        this.load.image("pause", "pause.png");
        this.load.image("close", "close.png");
        this.load.image("gameover_btn", "gameover_btn.png");
        this.load.image("sound_off", "sound_off.png");
        this.load.image("sound_on", "sound_on.png");
        this.load.image("easy", "easy_level_bg.png");
        this.load.image("medium", "medium_level_bg.png");
        this.load.image("hard", "hard_level_bg.png");

        this.load.image("gift", "gift.png");
        this.load.image("tile_green", "tile_green.png");

        this.load.image("puzzle_1", "puzzle_1.png");
        this.load.image("puzzle_2", "puzzle_2.png");
        this.load.image("puzzle_3", "puzzle_3.png");
        this.load.image("puzzle_4", "puzzle_4.png");
        this.load.image("puzzle_5", "puzzle_5.png");
        this.load.image("puzzle_6", "puzzle_6.png");
        this.load.image("puzzle_7", "puzzle_7.png");
        this.load.image("puzzle_8", "puzzle_8.png");
        this.load.image("puzzle_9", "puzzle_9.png");
        this.load.image("puzzle_10", "puzzle_10.png");
        this.load.image("puzzle_11", "puzzle_11.png");
        this.load.image("puzzle_12", "puzzle_12.png");
        this.load.image("puzzle_13", "puzzle_13.png");
        this.load.image("puzzle_14", "puzzle_14.png");
        this.load.image("puzzle_15", "puzzle_15.png");
        this.load.image("puzzle_16", "puzzle_16.png");
        this.load.image("puzzle_17", "puzzle_17.png");
        this.load.image("puzzle_18", "puzzle_18.png");
        this.load.image("puzzle_19", "puzzle_19.png");
        this.load.image("puzzle_20", "puzzle_20.png");
        this.load.image("puzzle_21", "puzzle_21.png");
        this.load.image("puzzle_22", "puzzle_22.png");
        this.load.image("puzzle_23", "puzzle_23.png");
        this.load.image("puzzle_24", "puzzle_24.png");
        this.load.image("puzzle_25", "puzzle_25.png");
        this.load.image("sad_mobile", "sad_mobile.png");
        this.load.image("later_btn", "later_btn.png");
        this.load.image("replay_btn", "replay_btn.png");
        this.load.image("main_menu_btn", "main_menu_btn.png");
        this.load.image("promo", "promo.png");
        this.load.image("copy_bg", "copy_bg.png");
        this.load.image("copy_btn", "copy_btn.png");
        this.load.image("puzzle_full", "puzzle_full.png");

        this.load.image(
            "onboarding_top_right_arrow",
            "onboarding_top_right_arrow.png"
        );
        this.load.image(
            "onboarding_top_left_arrow",
            "onboarding_top_left_arrow.png"
        );
        this.load.image("onboarding_row_0", "onboarding_row_0.png");
        this.load.image("onboarding_row_1", "onboarding_row_1.png");
        this.load.image("onboarding_row_2", "onboarding_row_2.png");

        this.load.image("tutorial_overlay", "tutorial_overlay.png");
        this.load.image("tutorial_finger", "tutorial_finger.png");
        this.load.image("tutorial_arrow_top", "tutorial_arrow_top.png");
        this.load.image("tutorial_arrow_left", "tutorial_arrow_left.png");
        this.load.image("play_btn", "play_btn.png");

        this.load.image("info_bg", "info_bg.png");
        this.load.image("info_btn", "info_btn.png");

        this.load.image("info_promo_bg", "info_promo_bg.png");
        this.load.image("to_main_btn", "to_main_btn.png");
        this.load.image("activate_btn", "activate_btn.png");
    }

    create() {
        this.scene.start("MainMenu");
    }
}

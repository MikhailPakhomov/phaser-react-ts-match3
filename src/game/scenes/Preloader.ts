import { Scene } from "phaser";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        const { width, height } = this.scale;
        //  We loaded this image in our Boot Scene, so we can display it here
        // this.add.image(width / 2, height / 2, "background");

        //  A simple progress bar. This is the outline of the bar.
        this.add
            .rectangle(width / 2, height / 2, 468, 32)
            .setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(
            width / 2 - 230,
            height / 2,
            4,
            28,
            0xffffff
        );

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        (this.textures as any).setFilter?.("nearest");
        //  Load the assets for the game - Replace with your own assets
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
        this.load.image("easy", "easy_level_bg.png");
        this.load.image("medium", "medium_level_bg.png");
        this.load.image("hard", "hard_level_bg.png");
        this.load.image("logo", "logo.png");
        this.load.image("gift", "gift.png");
        this.load.image("tile_green", "tile_green.png");
        this.load.image("win_bg", "win_bg.png");
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
        this.load.image("later_btn_lose", "later_btn_lose.png");
        this.load.image("promo", "promo.png");
        this.load.image("copy_bg", "copy_bg.png");
        this.load.image("copy_btn", "copy_btn.png");
        this.load.image("puzzle_full", "puzzle_full.png");
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start("MainMenu");
    }
}

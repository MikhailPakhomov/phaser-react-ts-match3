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
        this.load.image("background", "bg.png");
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
    }
          
    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start("MainMenu");
    }
}

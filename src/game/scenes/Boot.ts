import { Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
        (this.textures as any).setFilter?.("nearest");
        this.load.setPath("assets");
        this.load.image("logo", "logo.png");
        this.load.image("win_bg", "win_bg.png");
        this.load.image("preloader_sim", "preloader_sim.png");
        this.load.image("preloader_energy", "preloader_energy.png");
        this.load.image("preloader_smartphone", "preloader_smartphone.png");
        this.load.image("preloader_bar_bg", "preloader_bar_bg.png");
        this.load.image("preloader_bar_progress", "preloader_bar_progress.png");
    }

    create() {
        this.scene.start("Preloader");
    }
}

import { Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    // async init() {

    // }

    preload() {
        (this.textures as any).setFilter?.("nearest");
        this.load.setPath("assets");
        this.load.image("logo", "logo.png");
        this.load.image("win_bg", "win_bg.png");
        this.load.image("preloader_sim", "preloader_sim.png");
        this.load.image("preloader_energy", "preloader_energy.png");
        this.load.image("preloader_smartphone", "preloader_smartphone.png");
        this.load.image("preloader_bar_bg", "preloader_bar_bg.png");
        this.load.image("preloader_bar_progress", "preloader_bar_progress.png");
        this.load.image("start_btn", "start_btn.png");
    }

    async create() {
        
        await document.fonts.load("600 20px Nunito");
        await document.fonts.load("700 20px Nunito");
        await document.fonts.load("800 20px Nunito");
        await document.fonts.load("900 20px Nunito");
        this.scene.start("Preloader");
    }
}

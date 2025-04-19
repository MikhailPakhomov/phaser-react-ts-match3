export interface LevelGoal {
    type: string;
    count: number;
}

export interface LevelConfig {
    id: number;
    name: string;
    moves: number;
    elements: string[];
    rows: number;
    cols: number;
    goals: LevelGoal[];
    grid: (
        | false
        | { type: string; strength?: number; content?: { type: string } }
    )[][];
}

export const levelConfigs: LevelConfig[] = [
    {
        id: 1,
        name: "Уровень 1",
        moves: 13,
 
        elements: ["phone", "energy", "smartphone", "message"],
        goals: [
            { type: "energy", count: 25 },
            { type: "smartphone", count: 25 },
            { type: "box_full", count: 15 },
        ],
        grid: [
            // Стандартная 6x6 сетка
            [
                { type: "phone" },
                {
                    type: "phone",
                },
                { type: "message" },
                { type: "phone" },
                { type: "message" },
                { type: "phone" },
                { type: "phone" },
            ],
            [
                { type: "box", strength: 2 },
                { type: "phone" },
                { type: "energy" },
                { type: "discoball", isHelper: true, helperType: "discoball" },
                { type: "smartphone" },
                { type: "phone" },
                { type: "box", strength: 2 },
            ],
            [
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                // {
                //     type: "horizontalHelper",
                //     isHelper: true,
                //     helperType: "horizontalHelper",
                // },
                {
                    type: "ice",
                    content: {
                        type: "horizontalHelper",
                        isHelper: true,
                        helperType: "horizontalHelper",
                    },
                    strength: 2,
                },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
            ],
            [
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
            ],
            [
                { type: "energy" },
                { type: "smartphone" },
                { type: "energy" },
                { type: "smartphone" },
                { type: "energy" },
                { type: "smartphone" },
                { type: "energy" },
            ],
            [
                { type: "smartphone" },
                { type: "ice", content: { type: "energy" }, strength: 2 },
                { type: "smartphone" },
                { type: "energy" },
                { type: "smartphone" },
                { type: "ice", content: { type: "energy" }, strength: 2 },
                { type: "smartphone" },
            ],
            [
                { type: "energy" },
                { type: "ice", content: { type: "smartphone" }, strength: 2 },
                { type: "energy" },
                { type: "smartphone" },
                { type: "energy" },
                { type: "ice", content: { type: "smartphone" }, strength: 2 },
                { type: "energy" },
            ],
        ],
    },
];

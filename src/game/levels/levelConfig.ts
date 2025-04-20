export interface LevelGoal {
    type: string;
    count: number;
}

export interface LevelConfig {
    id: number;
    name: string;
    moves: number;
    elements: string[];
    difficult: string;
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
        difficult: "medium",
        elements: ["smartphone", "energy", "message", "sim"],
        goals: [
            { type: "sim", count: 25 },
            { type: "energy", count: 25 },
        ],
        grid: [
            [
                { type: "energy" },
                { type: "smartphone" },
                { type: "message" },
                { type: "sim" },
                { type: "smartphone" },
                { type: "energy" },
            ],
            [
                { type: "smartphone" },
                { type: "message" },
                { type: "message" },
                { type: "energy" },
                { type: "message" },
                { type: "smartphone" },
            ],
            [
                { type: "smartphone" },
                { type: "energy" },
                { type: "energy" },
                { type: "sim" },
                { type: "energy" },
                { type: "energy" },
            ],
            [
                { type: "sim" },
                { type: "sim" },
                { type: "energy" },
                { type: "sim" },
                { type: "sim" },
                { type: "smartphone" },
            ],
            [
                { type: "message" },
                { type: "sim" },
                { type: "sim" },
                { type: "smartphone" },
                { type: "message" },
                { type: "energy" },
            ],
            [
                { type: "smartphone" },
                { type: "message" },
                { type: "message" },
                { type: "smartphone" },
                { type: "smartphone" },
                { type: "message" },
            ],
        ],
    },
    {
        id: 2,
        name: "Уровень 2",
        moves: 12,
        difficult: "easy",
        elements: ["phone", "energy", "message", "sim"],
        goals: [
            { type: "sim", count: 15 },
            { type: "phone", count: 15 },
            { type: "box_full", count: 16 },
        ],
        grid: [
            [
                { type: "box", strength: 2 },
                {
                    type: "horizontalHelper",
                    isHelper: true,
                    helperType: "horizontalHelper",
                },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
            ],
            [
                { type: "box", strength: 2 },
                { type: "sim" },
                { type: "message" },
                { type: "phone" },
                {
                    type: "horizontalHelper",
                    isHelper: true,
                    helperType: "horizontalHelper",
                },
                { type: "box", strength: 2 },
            ],
            [
                { type: "box", strength: 2 },
                {
                    type: "horizontalHelper",
                    isHelper: true,
                    helperType: "horizontalHelper",
                },
                { type: "sim" },

                { type: "phone" },
                {
                    type: "verticallHelper",
                    isHelper: true,
                    helperType: "verticalHelper",
                },
                { type: "box", strength: 2 },
            ],
            [
                { type: "box", strength: 2 },
                { type: "sim" },
                { type: "phone" },
                { type: "message" },
                {
                    type: "horizontalHelper",
                    isHelper: true,
                    helperType: "horizontalHelper",
                },
                { type: "box", strength: 2 },
            ],
            [
                { type: "box", strength: 2 },
                {
                    type: "horizontalHelper",
                    isHelper: true,
                    helperType: "horizontalHelper",
                },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
                { type: "box", strength: 2 },
            ],
            [
                { type: "sim" },
                { type: "phone" },
                { type: "sim" },
                { type: "message" },
                { type: "phone" },
                { type: "sim" },
            ],
            [
                { type: "phone" },
                { type: "message" },
                { type: "phone" },
                { type: "phone" },
                { type: "sim" },
                { type: "message" },
            ],
        ],
    },
    {
        id: 3,
        name: "Уровень 3",
        moves: 13,
        difficult: "easy",
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
    {
        id: 4,
        name: "Уровень 4",
        moves: 3,
        difficult: "hard",
        elements: ["energy", "message", "smartphone", "sim"],
        goals: [{ type: "box_full", count: 2 }],
        grid: [
            // Стандартная 6x6 сетка
            [
                null,
                {
                    type: "box",
                    strength: 2,
                },
                { type: "energy" },
                { type: "sim" },
                { type: "box", strength: 2 },
                null,
            ],
            [
                { type: "smartphone" },
                { type: "energy" },
                { type: "message" },
                { type: "smartphone" },
                { type: "message" },
                { type: "smartphone" },
            ],
            [
                { type: "message" },
                { type: "energy" },
                { type: "energy" },
                { type: "message" },
                { type: "message" },
                { type: "energy" },
            ],
            [
                { type: "energy" },
                { type: "message" },
                {
                    type: "horizontalHelper",
                    isHelper: true,
                    helperType: "horizontalHelper",
                },
                { type: "energy" },
                { type: "smartphone" },
                { type: "message" },
            ],
            [
                { type: "sim" },
                { type: "smartphone" },
                { type: "energy" },
                {
                    type: "verticalHelper",
                    isHelper: true,
                    helperType: "verticalHelper",
                },
                { type: "sim" },
                { type: "energy" },
            ],
            [
                { type: "smartphone" },
                { type: "message" },
                { type: "energy" },
                { type: "message" },
                { type: "smartphone" },
                { type: "sim" },
            ],
            [
                null,
                { type: "smartphone" },
                { type: "sim" },
                { type: "smartphone" },
                { type: "sim" },
                null,
            ],
        ],
    },
];

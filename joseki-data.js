// Joseki Database - Common corner variations
const josekiDatabase = [
    {
        id: "3-4-point",
        name: "3-4 Point Approach",
        name_be: "Падыход да пункта 3-4",
        description: "Basic approach to 3-4 point",
        description_be: "Асноўны падыход да пункта 3-4",
        moves: [
            {x: 2, y: 3, color: "black"}, // 3-4 point
            {x: 4, y: 2, color: "white"}, // approach
            {x: 6, y: 2, color: "black"}, // pincer
            {x: 1, y: 1, color: "white"}, // attach
            {x: 0, y: 1, color: "black"}, // hane
            {x: 1, y: 0, color: "white"}, // extend
            {x: 3, y: 1, color: "black"}, // extend
        ]
    },
    {
        id: "4-4-point",
        name: "4-4 Point Approach",
        name_be: "Падыход да пункта 4-4",
        description: "Standard approach to 4-4 point",
        description_be: "Стандартны падыход да пункта 4-4",
        moves: [
            {x: 3, y: 3, color: "black"}, // 4-4 point
            {x: 3, y: 1, color: "white"}, // approach
            {x: 1, y: 3, color: "black"}, // pincer
            {x: 2, y: 2, color: "white"}, // attach
            {x: 1, y: 2, color: "black"}, // hane
            {x: 2, y: 1, color: "white"}, // extend
            {x: 4, y: 2, color: "black"}, // extend
        ]
    },
    {
        id: "3-3-point",
        name: "3-3 Point Invasion",
        name_be: "Уварванне ў пункт 3-3",
        description: "Classic 3-3 invasion",
        description_be: "Класічнае ўварванне ў пункт 3-3",
        moves: [
            {x: 2, y: 2, color: "black"}, // 3-4 point
            {x: 2, y: 0, color: "white"}, // approach
            {x: 0, y: 2, color: "black"}, // pincer
            {x: 1, y: 1, color: "white"}, // 3-3 invasion
            {x: 0, y: 1, color: "black"}, // block
            {x: 1, y: 0, color: "white"}, // extend
            {x: 2, y: 1, color: "black"}, // block
        ]
    },
    {
        id: "star-point",
        name: "Star Point Approach",
        name_be: "Падыход да зорнага пункта",
        description: "Approach to star point (4-4)",
        description_be: "Падыход да зорнага пункта (4-4)",
        moves: [
            {x: 3, y: 3, color: "black"}, // star point
            {x: 3, y: 1, color: "white"}, // approach
            {x: 1, y: 3, color: "black"}, // pincer
            {x: 2, y: 2, color: "white"}, // attach
            {x: 1, y: 2, color: "black"}, // hane
            {x: 2, y: 1, color: "white"}, // extend
            {x: 4, y: 2, color: "black"}, // extend
            {x: 3, y: 2, color: "white"}, // connect
        ]
    },
    {
        id: "corner-enclosure",
        name: "Corner Enclosure",
        name_be: "Агароджа вугла",
        description: "Building corner territory",
        description_be: "Будаўніцтва тэрыторыі вугла",
        moves: [
            {x: 2, y: 2, color: "black"}, // 3-4 point
            {x: 2, y: 0, color: "white"}, // approach
            {x: 0, y: 2, color: "black"}, // pincer
            {x: 1, y: 1, color: "white"}, // attach
            {x: 0, y: 1, color: "black"}, // hane
            {x: 1, y: 0, color: "white"}, // extend
            {x: 3, y: 1, color: "black"}, // extend
            {x: 2, y: 1, color: "white"}, // connect
            {x: 1, y: 3, color: "black"}, // enclosure
        ]
    },
    {
        id: "side-extension",
        name: "Side Extension",
        name_be: "Пашырэнне ўздоўж боку",
        description: "Extending along the side",
        description_be: "Пашырэнне ўздоўж боку дошкі",
        moves: [
            {x: 3, y: 3, color: "black"}, // 4-4 point
            {x: 3, y: 1, color: "white"}, // approach
            {x: 1, y: 3, color: "black"}, // pincer
            {x: 2, y: 2, color: "white"}, // attach
            {x: 1, y: 2, color: "black"}, // hane
            {x: 2, y: 1, color: "white"}, // extend
            {x: 4, y: 2, color: "black"}, // extend
            {x: 3, y: 2, color: "white"}, // connect
            {x: 5, y: 3, color: "black"}, // side extension
        ]
    }
];

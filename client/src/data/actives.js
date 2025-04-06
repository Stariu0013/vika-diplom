export const activesData = {
    "military": [
        {
            name: "Виробництво дронів",
            price: 23,
            percents: 2.3,
            risk: "low"
        },
        {
            name: "Кібербезпека",
            price: 25,
            percents: 3.1,
            risk: "medium"
        },
        {
            name: "Стартапи",
            price: 75,
            percents: 6.2,
            risk: "high"
        }
    ],
    "civil": [
        {
            name: "Відбудова мостів, доріг",
            price: 12,
            percents: 4.1,
            risk: "low"
        },
        {
            name: "Відбудова енергетики",
            price: 43,
            percents: 0.9,
            risk: "medium"
        },
        {
            name: "Відбудова електромереж",
            price: 85,
            percents: 9.1,
            risk: "high"
        }
    ]
}


// TODO: Field Risk

// 43 + 43 * 0.9
// 43 - 43 * 0.9

// low - < 25
//
// medium > 25 < 60
//
// high > 60
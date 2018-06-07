let rpg = {}

rpg.rollDices = function (dices, sides) {
        let rolls = []

        if (dices < 1 || sides < 1) {
                return rolls
        }

        for (let i = 0; i < dices; ++i) {
                let roll = Math.floor(Math.random() * sides) + 1

                rolls.push(roll)
        }

        return rolls
}

module.exports = rpg

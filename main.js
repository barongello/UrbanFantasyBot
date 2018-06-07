const pm = require('./playermanager.js')
const rpg = require('./rpg.js')
const Telegraf = require('telegraf')

const bot = new Telegraf('API KEY')

bot.command('start', ({ from, reply }) => {
	return reply('Hello, ladies and gentlemen!')
})

bot.use((ctx, next) => {
	const start = new Date()
	console.log('middleware', ctx.message)
	return next().then(() => {
		const ms = new Date() - start
		console.log('Response time %sms', ms)
	})
})

bot.command('/setname', ({ message, chat, from, replyWithMarkdown }) => {
	let matches = /^\/setname (.+)$/i.exec(message.text)

	if (!matches) {
		return
	}

	let oldName = pm.getPlayerName(chat, from)
	let newName = matches[1]

	let telegramName = pm.getPlayerTelegramName(chat, from)
	let titleName = pm.getPlayerTitleName(chat, from)

	pm.setPlayerName(chat, from, newName)

	let replyMessage = '[[setname]] [[' + titleName + ']]\n\n'

	replyMessage += '*' + (oldName ? oldName : telegramName) + '* is now known as *' + newName + '*'

	return replyWithMarkdown(replyMessage)
})

bot.command('/delname', ({ chat, from, replyWithMarkdown }) => {
	let player = pm.getPlayerName(chat, from)
	let titleName = pm.getPlayerTitleName(chat, from)

	let replyMessage = '[[delname]] [[' + titleName + ']]\n\n'

	if (!player) {
		replyMessage += 'Thou art known by *no one* already!'
	}
	else {
		pm.deletePlayerName(chat, from)

		replyMessage += '_* Thou were thrown into oblivion! *_'
	}

	return replyWithMarkdown(replyMessage)
})

bot.command('/roll', ({ message, chat, from, replyWithMarkdown }) => {
	let matches = /^\/roll (.*)$/i.exec(message.text)

	if (!matches) {
		return
	}

	let titleName = pm.getPlayerTitleName(chat, from)

	let rollMacro = pm.getRollMacro(chat, from, matches[1])
	console.log(rollMacro)
	let tokens = rollMacro ? rollMacro.split(' ') : matches[1].split(' ')
	let rounds = []
	let totalRollsSum = []
	let totalRollsTotal = []
	let totalDices = 0
	let totalSides = 0
	let totalSum = 0
	let hadModifier = false
	let totalModifier = 0
	let totalTotal = 0
	let totalCultist = false

	for (let token of tokens) {
		matches = /^([0-9]+)d([0-9]+)([-+][0-9]+)?$/i.exec(token)

		if (matches) {
			let dices = parseInt(matches[1])
			let sides = parseInt(matches[2])
			let modifier = matches[3] ? parseInt(matches[3]) : null

			totalDices += dices
			totalSides += sides
			totalModifier += modifier

			hadModifier |= modifier ? true : false

			totalCultist |= dices === 666
			totalCultist |= sides === 666
			totalCultist |= Math.abs(modifier ? modifier : 0) === 666

			totalCultist |= (dices + sides) === 666
			totalCultist |= (dices * sides) === 666

			rounds.push([dices, sides, modifier])
		}
	}

	if (rounds.length < 1) {
		return
	}

	totalCultist |= totalDices === 666
	totalCultist |= totalSides === 666

	totalCultist |= (totalDices + totalSides) === 666
	totalCultist |= (totalDices * totalSides) === 666

	let replyMessage = '[[roll]] [[' + titleName + ']]\n'

	if (totalDices < 1) {
		replyMessage += '\n'
		replyMessage += '_* Thou roll nothing! *_'
	}
	else if (totalDices > 100) {
		replyMessage += '\n'
		replyMessage += 'Too many dice to roll at once!'
	}
	else {
		for (let round of rounds) {
			let dices = round[0]
			let sides = round[1]
			let modifier = round[2]

			replyMessage += '\n[[' + dices + 'd' + sides + (modifier ? (modifier < 0 ? modifier : '+' + modifier) : '') + ']] '

			if (dices < 1) {
				replyMessage += 'No die to roll!'
				continue
			}
			else if (dices > 100) {
				replyMessage += 'Too many dice to roll at once!'
				continue
			}
			else if (sides < 1) {
				replyMessage += 'A die without faces? From which dimension art thee?'
				continue
			}

			let rolls = rpg.rollDices(dices, sides)
			let sum = rolls.reduce((t, e) => t + e)
			let total = sum + (modifier ? modifier : 0)
			let localCultist = false

			localCultist |= dices === 666
			localCultist |= sides === 666

			localCultist |= (dices + sides) === 666
			localCultist |= (dices * sides) === 666

			localCultist |= sum === 666
			localCultist |= total === 666

			if (dices > 1) {
				replyMessage += rolls.join(' + ') + ' = *' + sum + '*'
			}
			else {
				replyMessage += '*' + rolls[0] + '*'
			}

			if (modifier) {
				replyMessage += ' *(' + modifier + ')* = *' + total + '*'
			}

			if (localCultist) {
				replyMessage += ' _(Art thee a cultist, I see?)_'
			}

			totalRollsSum.push(sum)
			totalRollsTotal.push(total)
			totalSum += sum
			totalTotal += total
			totalCultist |= localCultist
		}
	}

	if (rounds.length > 1) {
		replyMessage += '\n\n'
		replyMessage += '[[Total]] ' + totalRollsSum.join(' + ') + ' = *' + totalSum + '*' + (hadModifier ? ' *(' + totalModifier + ')* = ' + totalRollsTotal.join(' + ') + ' = *' + totalTotal + '*' : '')
	}

	if (totalCultist) {
		replyMessage += '\n\n'
		replyMessage += 'Praise Yogg!'
	}

	return replyWithMarkdown(replyMessage)
})

bot.command('/setrollmacro', ({ message, chat, from, replyWithMarkdown }) => {
	let matches = /^\/setrollmacro (.+)$/i.exec(message.text)

	if (!matches) {
		return
	}

	let titleName = pm.getPlayerTitleName(chat, from)

	let replyMessage = '[[setrollmacro]] [[' + titleName + ']]\n\n'

	let tokens = matches[1].split(' ')
	let macroName
	let macroRoll

	if (tokens.length < 2) {
		replyMessage += 'Nothing to set!'
	}
	else {
		macroName = tokens[0]
		macroRoll = tokens.slice(1).join(' ')

		pm.setRollMacro(chat, from, macroName, macroRoll)

		replyMessage += 'Roll macro *' + (macroName) + '* registered as *' + macroRoll + '*'
	}

	return replyWithMarkdown(replyMessage)
})

bot.command('/delrollmacro', ({ message, chat, from, replyWithMarkdown }) => {
	let matches = /^\/delrollmacro (.+)$/i.exec(message.text)

	if (!matches) {
		return
	}

	let titleName = pm.getPlayerTitleName(chat, from)

	let replyMessage = '[[delrollmacro]] [[' + titleName + ']]\n\n'

	let macroName = matches[1]
	let macroRoll = pm.getRollMacro(chat, from, macroName)

	if (!macroRoll) {
		replyMessage += 'Thou have no roll macro with this name!'
	}
	else {
		pm.deleteRollMacro(chat, from, macroName)

		replyMessage += 'The roll macro *' + macroName + '* was thrown into the _void_!'
	}

	return replyWithMarkdown(replyMessage)
})

pm.loadPlayerNames()

bot.startPolling()

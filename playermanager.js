const fs = require('fs')

let playerManager = {
	players: {}
};

playerManager.savePlayerData = function () {
        let json = JSON.stringify(this.players);

        fs.writeFile('players.json', json, 'utf8', (err) => {
                if (err) {
                        console.log('error', 'Error saving players file:', err)
                }
        })
}

playerManager.loadPlayerNames = function () {
	let _this = this;

        fs.readFile('players.json', 'utf8', (err, data) => {
                if (err) {
                        console.log('error', 'Error loading players file:', err)
                        return
                }

                _this.players = JSON.parse(data)
        })
}

playerManager.deletePlayerName = function (chat, user) {
	if (!this.players.hasOwnProperty(chat.id)) {
		return
	}
	else if (!this.players[chat.id].hasOwnProperty(user.id)) {
		return
	}
	else if (!this.players[chat.id][user.id].hasOwnProperty('name')) {
		return
	}

	delete this.players[chat.id][user.id].name

	this.savePlayerData()
}

playerManager.setPlayerName = function (chat, user, name) {
        if (!this.players.hasOwnProperty(chat.id)) {
                this.players[chat.id] = {}
        }

	if (!this.players[chat.id].hasOwnProperty(user.id)) {
		this.players[chat.id][user.id] = {}
	}

        this.players[chat.id][user.id].name = name

        this.savePlayerData()
}

playerManager.getPlayerName = function (chat, user) {
	let name

	if (!this.players.hasOwnProperty(chat.id)) {
		name = null
        }
	else if (!this.players[chat.id].hasOwnProperty(user.id)) {
                name = null
        }
	else if (!this.players[chat.id][user.id].hasOwnProperty('name')) {
                name = null
        }
	else {
		name = this.players[chat.id][user.id].name
	}

	return name
}

playerManager.getPlayerRealName = function (chat, user) {
	let name

	if (user.first_name) {
		name = user.first_name

		if (user.last_name) {
			name += ' ' + user.last_name
		}
	}
	else if (user.last_name) {
		name = user.last_name
	}
	else {
		name = 'Anonymous User'
	}

	return name
}

playerManager.getPlayerTelegramName = function (chat, user) {
	let displayName

	if (user.username) {
		displayName = user.username
	}
	else {
		displayName = this.getPlayerRealName(chat, user)
	}

	return displayName
}

playerManager.getPlayerTitleName = function (chat, user) {
	let name = this.getPlayerName(chat, user)
	let telegramName = this.getPlayerTelegramName(chat, user)

	let titleName

	if (name) {
		titleName = name + ' (' + telegramName + ')'
	}
	else {
		titleName = telegramName
	}

	return titleName
}

playerManager.setRollMacro = function (chat, user, macroName, macroRoll) {
	if (!this.players.hasOwnProperty(chat.id)) {
                this.players[chat.id] = {}
        }

	if (!this.players[chat.id].hasOwnProperty(user.id)) {
		this.players[chat.id][user.id] = {}
	}

	if (!this.players[chat.id][user.id].hasOwnProperty('rollMacros')) {
		this.players[chat.id][user.id].rollMacros = {}
	}

	this.players[chat.id][user.id].rollMacros[macroName] = macroRoll

	this.savePlayerData()
}

playerManager.getRollMacro = function (chat, user, macroName) {
	let macroRoll

	if (!this.players.hasOwnProperty(chat.id)) {
		macroRoll = null
	}
	else if (!this.players[chat.id].hasOwnProperty(user.id)) {
		macroRoll = null
	}
	else if (!this.players[chat.id][user.id].hasOwnProperty('rollMacros')) {
		macroRoll = null
	}
	else if (!this.players[chat.id][user.id].rollMacros.hasOwnProperty(macroName)) {
		macroRoll = null
	}
	else {
		macroRoll = this.players[chat.id][user.id].rollMacros[macroName]
	}

	return macroRoll
}

playerManager.deleteRollMacro = function (chat, user, macroName) {
	if (!this.players.hasOwnProperty(chat.id)) {
		return
	}
	else if (!this.players[chat.id].hasOwnProperty(user.id)) {
		return
	}
	else if (!this.players[chat.id][user.id].hasOwnProperty('rollMacros')) {
		return
	}
	else if (!this.players[chat.id][user.id].rollMacros.hasOwnProperty(macroName)) {
		return
	}

	delete this.players[chat.id][user.id].rollMacros[macroName]

	this.savePlayerData()
}

module.exports = playerManager

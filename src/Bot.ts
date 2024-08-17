import 'dotenv/config';
import Logger from 'logger';

import Utils from './utils/index';
import Parsing from './utils/parsing';

import config from '../config.json';

import fs from 'fs';
import url from 'url';
import path from 'path';
import EventBase from './types/EventBase';
import { loadCommands, loadEvents } from './utils/fileHandling';
import { CommandClient, Constants } from 'athena';
import Database from './database/database';
import ReminderQueue from './Jobs/Reminders';

export default class NotiFyre {
    config = config;
    dev = config.DEV;
    bot: CommandClient<NotiFyre>;
    logger = Logger;

    database: Database;

    utils: Utils;
    parsing: Parsing;
    events = new Map<string, EventBase>();
    reminders: ReminderQueue;

    constructor() {
        this.utils = new Utils(this);
        this.parsing = new Parsing(this);
        this.database = new Database(this);
        this.bot = new CommandClient({
            token: `Bot ${this.config.TOKEN}`,
            options: { intents: [Constants.GatewayIntentBits.Guilds] },
            commandContext: this,
            commandMiddleware: async (interaction) => {
                if (!interaction.isCommand()) return { user: null };

                if (interaction.guild) {
                    const _guild = await this.database.guild.get(interaction.guild.id);
                    if (_guild?.guildName !== interaction.guild.name) {
                        await this.database.guild.update(interaction.guild.id, { guildName: interaction.guild.name });
                    }
                }

                const _user = interaction.member ? interaction.member.user : interaction.user;
                if (!_user) return { user: null };

                let user = await this.database.user.get(_user?.id);
                if (!user) user = await this.database.user.create({ id: _user.id, name: _user.displayName(true) });

                if (_user.displayName(true) !== user.name)
                    user = await this.database.user.update(user.id, {
                        name: _user.displayName(true),
                    });

                return { user };
            },
            deployGlobally: true,
        });
        this.reminders = new ReminderQueue(this);
    }

    async start() {
        this.logger.info('Getting ready..');
        await this.loadCommands();
        await this.loadEvents();
        await this.bot.connect();
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        if (!fs.existsSync(url.pathToFileURL(commandsPath))) return this.logger.warning(`Unable to load commands`);

        let commands = await loadCommands(commandsPath);
        commands.forEach((command) => this.bot.registerCommand(command));

        this.logger.info(`Loaded ${commands.size} commands`);
    }

    async loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        if (!fs.existsSync(url.pathToFileURL(eventsPath))) return this.logger.warning(`Unable to load events`);

        this.events = await loadEvents(eventsPath);
        this.events.forEach((event) => this.bot.on(event.name, (...args) => event.handle(this, ...args)));

        this.logger.info(`Loaded ${this.events.size} events`);
    }
}

new NotiFyre().start();

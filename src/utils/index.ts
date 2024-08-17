import NotiFyre from '../Bot';
import moment from 'moment-timezone';
import { readFileSync } from 'fs';
import path from 'path';

export default class Utils {
    bot: NotiFyre['bot'];
    config: NotiFyre['config'];
    constructor(caller: NotiFyre) {
        this.bot = caller.bot;
        this.config = caller.config;
    }

    getTime(timezone = 'UTC', timestamp = new Date()) {
        const dateObject = moment(timestamp).tz(timezone || 'UTC');
        return {
            dateObject,
            time: dateObject.format('HH:mm:ss'),
            date: dateObject.format('YYYY-MM-DD'),
        };
    }

    getUser(ID: string) {
        return this.bot.users.get(ID);
    }

    async getMember(guildID: string, userID: string) {
        const guild = this.bot.guilds.get(guildID);
        return guild?.members.get(userID);
    }

    randomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    uppercaseWords(str: string) {
        return str.replace(/^(.)|\s+(.)/g, (c) => c.toUpperCase());
    }

    createPages<T>(arr: T[], size: number) {
        const pages: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            pages.push(arr.slice(i, i + size));
        }
        return pages;
    }

    async removeAllGlobalCommands() {
        let commands = await this.bot.getCommands();
        commands.forEach((command) => this.bot.deleteCommand(command.id));
        return;
    }

    async removeAllGuildCommands(guild: string) {
        let commands = await this.bot.getGuildCommands(guild);
        commands.forEach((command) => this.bot.deleteGuildCommand(guild, command.id));
        return;
    }

    createWebhookAvatar() {
        const file = readFileSync(path.join(__dirname, '../../assets/notifyre.png'));
        return `data:image/png;base64,${Buffer.from(file).toString('base64')}`;
    }
}

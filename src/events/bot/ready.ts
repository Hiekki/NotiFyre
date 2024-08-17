import EventBase from '../../types/EventBase';
import { Constants, Events } from 'athena';
import NotiFyre from '../../Bot';
import { BotColors } from '../../utils/constants/index';
import GuildCreate from './guildCreate';

export default class Ready extends EventBase {
    name: keyof Events = 'ready';
    enabled = true;

    async handle(caller: NotiFyre) {
        if (!this.enabled) return;

        caller.logger.info(`${caller.bot.user?.username} is ready on ${caller.bot.guilds.size} guilds.`);
        caller.bot.setActivity(Constants.ActivityType.Custom, 'a', 'NotiFyre of things.');

        if (caller.config.FORCE_DEPLOY) await caller.bot.deployCommands();
        if (caller.dev) return;

        await caller.bot.createMessage(caller.config.CHANNEL.STATUS, {
            embeds: [
                {
                    title: `${caller.bot.user?.username} Ready`,
                    description: `${caller.bot.guilds.size} guilds`,
                    color: BotColors.green,
                },
            ],
        });

        const guilds = await caller.database.guild.all();
        const ids = guilds.map((guild) => guild.guildID);

        for (const [k, guild] of caller.bot.guilds.entries()) {
            if (!ids.includes(guild.id)) {
                caller.logger.info(`${guild.name} (${guild.id}) is not in the Database; adding now...`);
                new GuildCreate().handle(caller, guild);
            }
        }

        for (const guild of ids) {
            if (!caller.bot.guilds.has(guild)) {
                caller.logger.info(`Bot left guild (${guild}) while offline; removing from database...`);
                await caller.database.guild.delete(guild);
                await caller.bot.createMessage(caller.config.CHANNEL.STATUS, {
                    embeds: [
                        {
                            color: BotColors.red,
                            title: 'Left Guild',
                            description: `Bot left guild (${guild}) while offline`,
                        },
                    ],
                });
            }
        }

        caller.logger.info(`Bot ready.`);
    }
}

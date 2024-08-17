import EventBase from '../../types/EventBase';
import { Constants, Events, Guild } from 'athena';
import NotiFyre from '../../Bot';
import { BotColors } from '../../utils/constants';
import moment from 'moment';

export default class GuildCreate extends EventBase {
    name: keyof Events = 'guildDelete';
    enabled = true;

    async handle(caller: NotiFyre, guild: Guild) {
        if (!this.enabled) return;

        caller.logger.info(`Left guild - ${guild.name} (${guild.id})`);

        await caller.bot.createMessage(caller.config.CHANNEL.GUILD, {
            embeds: [
                {
                    color: BotColors.red,
                    title: 'Left Guild',
                    description: `**Name:** ${guild.name}\n**ID:** ${guild.id}\n**Created:** ${moment(guild.createdAt).format(
                        'LLLL',
                    )}\n**Age:** ${caller.parsing.accountAge(guild.createdAt)}\n\n**Count:** ${guild.memberCount}\n**Users:** ${guild.memberCount}`,
                    thumbnail: {
                        url: guild.icon
                            ? (guild.dynamicIconURL(
                                  guild.icon.indexOf('a_') !== -1 ? Constants.ImageFormat.GIF : Constants.ImageFormat.PNG,
                                  512,
                              ) ?? '')
                            : '',
                    },
                    footer: {
                        text: caller.bot.user.username,
                        icon_url: caller.bot.user.dynamicAvatarURL(Constants.ImageFormat.PNG, 512),
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
        });

        await caller.database.guild.delete(guild.id);
    }
}

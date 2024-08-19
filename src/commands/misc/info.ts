import { Command, CommandBuilder, CommandInteraction, Constants, VERSION } from 'athena';
import NotiFyre from '../../Bot';
import { BotColors } from '../../utils/constants';
import { version } from 'process';
import numeral from 'numeral';

export default class Info extends Command<NotiFyre> {
    id = 'info';
    definition = new CommandBuilder('info', 'Info about the bot').setCommandType(Constants.ApplicationCommandType.ChatInput);

    async handleCommand(caller: NotiFyre, command: CommandInteraction) {
        try {
            await command.createMessage({
                embeds: [
                    {
                        title: 'NotiFyre Information',
                        color: BotColors.notifyre,
                        fields: [
                            {
                                name: 'Library',
                                value: `Athena v${VERSION}`,
                                inline: true,
                            },
                            {
                                name: 'Node.JS',
                                value: version,
                                inline: true,
                            },
                            {
                                name: 'Bot Version',
                                value: process.env.npm_package_version ? `v${process.env.npm_package_version}` : 'N/A',
                                inline: true,
                            },
                            {
                                name: 'Guilds',
                                value: numeral(caller.bot.guilds.size).format('0,0'),
                                inline: true,
                            },
                            {
                                name: 'Users',
                                //@ts-ignore --It works
                                value: numeral(caller.bot.guilds.reduce((a, v) => a + v.memberCount, 0)).format('0,0'),
                                inline: true,
                            },
                            {
                                name: 'Reminders',
                                value: numeral((await caller.database.reminder.all.fetch()).length).format('0,0'),
                                inline: true,
                            },
                            {
                                name: 'Links',
                                value: '[Support Server](https://discord.gg/elenora)\n[Bot Invite](https://discord.com/oauth2/authorize?client_id=1248777984622465165)\n[Terms of Service](https://www.elenora.gg/tos)\n[Privacy Policy](https://www.elenora.gg/privacy)',
                                inline: false,
                            },
                            {
                                name: 'Made By:',
                                value: 'Hiekki\nFire\nAzorant',
                            },
                        ],
                    },
                ],
                flags: Constants.MessageFlags.Ephemeral,
            });
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

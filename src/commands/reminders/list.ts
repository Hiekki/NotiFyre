import { Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import NotiFyre from '../../Bot';
import { ErrorMessage, Pagination } from '../../utils/message';
import { BotColors } from '../../utils/constants';
import { createPages } from 'fires-utils';

export default class List extends Command<NotiFyre> {
    id = 'list';
    definition = new CommandBuilder('list', 'List all of your active reminders')
        .setCommandType(Constants.ApplicationCommandType.ChatInput)
        .setIntegrationTypes([Constants.ApplicationIntegrationType.UserInstall, Constants.ApplicationIntegrationType.GuildInstall]);

    async handleCommand(caller: NotiFyre, command: CommandInteraction) {
        try {
            const user = command.member ? command.member.user : command.user;
            if (!user) return ErrorMessage(command, 'Failed to get user information. Please try again.', true);

            const list = await caller.database.reminder.all.user(user.id);
            if (!list.length) {
                return await command.createMessage({
                    embeds: [{ title: 'No Active Reminders', color: BotColors.notifyre }],
                    flags: Constants.MessageFlags.Ephemeral,
                });
            }

            const pages = createPages(list, 10);
            const embeds: Constants.APIEmbed[] = pages.map((page) => {
                return {
                    title: 'Active Reminders',
                    color: BotColors.notifyre,
                    fields: page.map((reminder) => {
                        return {
                            name: `ID: ${reminder.id}`,
                            value: `**Ends:** <t:${caller.parsing.unix(reminder.endsAt)}:R>\n**Message:** ${reminder.content}`,
                        };
                    }),
                };
            });

            await Pagination(caller, embeds, command, user.id, true, embeds.length >= 3, true);
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

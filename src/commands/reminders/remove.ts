import { AutocompleteInteraction, Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import NotiFyre from '../../Bot';
import { ErrorMessage, SuccessMessage } from '../../utils/message';
import { MiddleWareType } from '../../types/MiddleWare';

export default class Remove extends Command<NotiFyre> {
    id = 'remove';
    definition = new CommandBuilder('remove', 'Remove an active reminder')
        .setCommandType(Constants.ApplicationCommandType.ChatInput)
        .setIntegrationTypes([Constants.ApplicationIntegrationType.UserInstall, Constants.ApplicationIntegrationType.GuildInstall])
        .addIntegerOption({
            name: 'id',
            description: 'The ID of the reminder to remove. (Can be found in the /list command)',
            required: true,
            autocomplete: true,
        });

    async handleCommand(caller: NotiFyre, command: CommandInteraction) {
        try {
            const user = command.member ? command.member.user : command.user;
            if (!user) return;

            const ID = command.getRequiredInteger('id');
            const reminder = await caller.database.reminder.get(ID);
            if (!reminder || reminder.userID != user.id) {
                return await ErrorMessage(command, 'Could not find a reminder with that ID.', true);
            }

            await caller.database.reminder.delete(ID);

            await SuccessMessage(command, `Reminder with ID \`${ID}\` has been removed.`, true);
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }

    async handleAutocomplete(caller: NotiFyre, interaction: AutocompleteInteraction) {
        const user = interaction.member ? interaction.member.user : interaction.user;
        if (!user) return;

        const focused = interaction.focused()?.value as string;
        const reminders = await caller.database.reminder.all.user(user.id);
        const result = reminders
            .map((reminder) => {
                return {
                    name: `ID: ${reminder.id} | Reminder: ${reminder.content.length > 28 ? reminder.content.substring(0, 25) + '...' : reminder.content}`,
                    value: reminder.id,
                };
            })
            .filter((reminder) => {
                return reminder.name.toLowerCase().includes(focused.toLowerCase());
            })
            .slice(0, 25);
        await interaction.acknowledge(result);
    }
}

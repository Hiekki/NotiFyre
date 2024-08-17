import { AutocompleteInteraction, Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import NotiFyre from '../../Bot';
import { ErrorMessage, SuccessMessage } from '../../utils/message';

export default class Timezone extends Command<NotiFyre> {
    id = 'timezone';
    definition = new CommandBuilder('timezone', 'What timezone are you in?')
        .setCommandType(Constants.ApplicationCommandType.ChatInput)
        .setIntegrationTypes([Constants.ApplicationIntegrationType.UserInstall, Constants.ApplicationIntegrationType.GuildInstall])
        .addStringOption({
            name: 'location',
            description: 'Choose which timezone you would like to set for your reminders.',
            required: true,
            autocomplete: true,
        });

    async handleCommand(caller: NotiFyre, command: CommandInteraction) {
        try {
            const user = command.member ? command.member.user : command.user;
            if (!user) return;

            const timezone = command.getRequiredString('location');

            // @ts-ignore
            const allTimezones: string[] = Intl.supportedValuesOf('timeZone');
            if (!allTimezones.includes(timezone)) {
                return await ErrorMessage(command, `The timezone \`${timezone}\` is not supported.`, true);
            }

            await caller.database.user.update(user.id, { timezone });

            await SuccessMessage(command, `You have set your timezone to \`${timezone}\`.`, true);
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }

    async handleAutocomplete(caller: NotiFyre, interaction: AutocompleteInteraction) {
        // @ts-ignore
        const timezones: string[] = Intl.supportedValuesOf('timeZone');
        const focused = interaction.focused()?.value as string;
        const result = timezones
            .filter((tz) => tz.toLowerCase().includes(focused.toLowerCase()))
            .map((tz) => {
                return { name: tz, value: tz };
            })
            .slice(0, 25);
        await interaction.acknowledge(result);
    }
}

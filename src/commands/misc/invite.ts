import { Command, CommandBuilder, CommandInteraction, ComponentBuilder, Constants } from 'athena';
import NotiFyre from '../../Bot';
import { BotColors } from '../../utils/constants';

export default class Invite extends Command<NotiFyre> {
    id = 'invite';
    definition = new CommandBuilder('invite', 'Invite the bot').setCommandType(Constants.ApplicationCommandType.ChatInput);

    async handleCommand(caller: NotiFyre, command: CommandInteraction) {
        try {
            await command.createMessage({
                embeds: [
                    {
                        description: "# NotiFyre's Invite Links",
                        color: BotColors.notifyre,
                    },
                ],
                components: new ComponentBuilder()
                    .addActionRow((row) => {
                        row.addURLButton({
                            label: 'Invite NotiFyre',
                            url: 'https://discord.com/oauth2/authorize?client_id=1248777984622465165',
                        }).addURLButton({
                            label: 'Support Server',
                            url: 'https://discord.gg/45N5FXe',
                        });
                    })
                    .toJSON(),
                flags: Constants.MessageFlags.Ephemeral,
            });
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

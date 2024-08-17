import { Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import NotiFyre from '../../Bot';

export default class Template extends Command<NotiFyre> {
    id = 'template';
    definition = new CommandBuilder('template', 'template command').setCommandType(Constants.ApplicationCommandType.ChatInput);

    async handleCommand(caller: NotiFyre, command: CommandInteraction) {
        try {
            await command.createMessage({ content: 'Hello!' });
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

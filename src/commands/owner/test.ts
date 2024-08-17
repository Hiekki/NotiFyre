import NotiFyre from '../../Bot';
import { BotColors, BotEmojis, BotPermissions } from '../../utils/constants';
import { Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import { ConfirmAction, ErrorMessage, Pagination, SuccessMessage } from '../../utils/message';
import words from 'naughty-words';
import moment from 'moment';
import { MiddleWareType } from '../../types/MiddleWare';

export default class Test extends Command<NotiFyre> {
    id = 'test';
    definition = new CommandBuilder('test', 'Tests things')
        .setCommandType(Constants.ApplicationCommandType.ChatInput)
        .addStringOption({ name: 'input', description: 'words', required: true });

    developerOnly = true;
    guilds = ['671824837899059210'];

    async handleCommand(caller: NotiFyre, command: CommandInteraction, commandData: MiddleWareType) {
        try {
            const date = new Date('2024-08-23T20:00:00.000Z');

            await command.createMessage({
                content: `<t:${caller.parsing.unix(date)}:f>`,
            });
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

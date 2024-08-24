import NotiFyre from '../../Bot';
import { Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import moment from 'moment';
import { MiddleWareType } from '../../types/MiddleWare';
import * as chrono from 'chrono-node';
import { DateTime } from 'luxon';

export default class Test extends Command<NotiFyre> {
    id = 'test';
    definition = new CommandBuilder('test', 'Tests things')
        .setCommandType(Constants.ApplicationCommandType.ChatInput)
        .addStringOption({ name: 'input', description: 'words', required: true });

    developerOnly = true;
    guilds = ['671824837899059210'];

    async handleCommand(caller: NotiFyre, command: CommandInteraction, commandData: MiddleWareType) {
        try {
            const userStartDate = DateTime.fromJSDate(moment().toDate()).setZone(commandData.user!.timezone!);
            const rawTime = command.getRequiredString('input');
            const userTimeZone = 'America/Chicago';

            let chronoTime = chrono.parseDate(rawTime);
            if (!chronoTime) return;
            const dateInUserTZ = DateTime.fromJSDate(chronoTime).setZone(userTimeZone);

            console.log('CHRONO TIME: ', chronoTime);
            console.log('LUXON: ', dateInUserTZ);

            command.createMessage({ content: 'Console..' });
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

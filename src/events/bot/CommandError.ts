import EventBase from '../../types/EventBase';
import { Events, Interaction, CommandErrorData, CommandError } from 'athena';
import NotiFyre from '../../Bot';

export default class CommandErrorEvent extends EventBase {
    name: keyof Events = 'commandError';
    enabled = true;

    async handle(caller: NotiFyre, command: string, interaction: Interaction, error: CommandErrorData) {
        if (!this.enabled) return;

        switch (error.type) {
            case CommandError.NotDeveloperGuild: //0
            case CommandError.DeniedUser: //1
            case CommandError.DeniedGuild: //2
            case CommandError.MissingPermission: //3
            case CommandError.OnCooldown: //4
            case CommandError.MiddlewareError: //5
            case CommandError.UncaughtError: //6
                caller.logger.error(`[${command}] Command errored with ${error.data}`);
                break;
            default:
                caller.logger.warning(`[${command}] Command errored`);
                caller.logger.error(error);
        }
    }
}

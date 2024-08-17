import EventBase from '../../types/EventBase';
import { Events } from 'athena';
import NotiFyre from '../../Bot';
import { BotColors } from '../../utils/constants';

export default class Disconnect extends EventBase {
    name: keyof Events = 'disconnect';
    enabled = true;

    async handle(caller: NotiFyre) {
        if (!this.enabled) return;

        caller.logger.warning('Bot disconnected.');
        if (caller.dev) return;

        await caller.bot.createMessage(caller.config.CHANNEL.STATUS, {
            embeds: [
                {
                    title: `${caller.bot.user?.username} Disconnected`,
                    color: BotColors.sharkleberryFin,
                },
            ],
        });
    }
}

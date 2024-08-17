import EventBase from '../../types/EventBase';
import { Events } from 'athena';
import NotiFyre from '../../Bot';

export default class Template extends EventBase {
    name: keyof Events = 'interactionCreate';
    enabled = true;

    async handle(caller: NotiFyre) {
        if (!this.enabled) return;
    }
}

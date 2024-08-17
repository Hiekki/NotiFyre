import { Events } from 'athena';
import NotiFyre from '../Bot';

interface EventBase {}

abstract class EventBase {
    /**
     * Name of the event
     *
     * @abstract
     * @type {string}
     * @memberof EventBase
     */
    abstract name: keyof Events;

    /**
     * Is enabled
     *
     * @abstract
     * @type {boolean}
     * @memberof EventBase
     */
    abstract enabled: boolean;

    abstract handle(caller: NotiFyre, ...args: Events[EventBase['name']]['arguments']): any;
}

export default EventBase;

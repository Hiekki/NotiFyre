import { Message } from 'athena';

export default interface MessageObject extends Message {
    params: string[];
    prefix: string;
    command_name: string;
}

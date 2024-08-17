import NotiFyre from '../Bot';
import { PrismaClient } from '@prisma/client';
import Guild from './models/guild';
import User from './models/user';
import Reminder from './models/reminder';
import Webhook from './models/webhook';

export default class Database {
    caller: NotiFyre;
    private prisma = new PrismaClient();
    guild: Guild;
    user: User;
    reminder: Reminder;
    webhook: Webhook;

    constructor(caller: NotiFyre) {
        this.caller = caller;
        this.guild = new Guild(this.prisma);
        this.user = new User(this.prisma);
        this.reminder = new Reminder(this.prisma);
        this.webhook = new Webhook(this.prisma);
    }
}

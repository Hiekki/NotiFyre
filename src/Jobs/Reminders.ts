import NotiFyre from '../Bot';
import { MessageReplyContent } from '../types/MessageTypes';
import { BotColors } from '../utils/constants';

export default class ReminderQueue {
    bot: NotiFyre['bot'];
    config: NotiFyre['config'];
    logger: NotiFyre['logger'];
    parsing: NotiFyre['parsing'];
    reminders: NotiFyre['database']['reminder'];
    users: NotiFyre['database']['user'];
    webhooks: NotiFyre['database']['webhook'];
    queueLock = false;

    constructor(caller: NotiFyre) {
        this.bot = caller.bot;
        this.config = caller.config;
        this.logger = caller.logger;
        this.parsing = caller.parsing;
        this.reminders = caller.database.reminder;
        this.users = caller.database.user;
        this.webhooks = caller.database.webhook;

        this.start();
        this.logger.info('Grabbing reminders..');
    }

    async start() {
        setInterval(async () => {
            if (!this.queueLock) {
                this.send();
            }
        }, 5 * 1000);
    }

    async send() {
        const reminders = await this.reminders.all.expired();
        if (!reminders.length) return;

        this.queueLock = true;

        for (const reminder of reminders) {
            const user = await this.users.get(reminder.userID);
            if (!user) continue;

            const message: MessageReplyContent = {
                content: `<@${user.id}>`,
                allowed_mentions: { users: [user.id] },
                embeds: [
                    {
                        title: `Reminder!`,
                        color: BotColors.notifyre,
                        fields: [
                            {
                                name: `Created On:`,
                                value: `<t:${this.parsing.unix(reminder.createdAt)}:f> | <t:${this.parsing.unix(reminder.createdAt)}:R>`,
                                inline: true,
                            },
                            {
                                name: `Message:`,
                                value: reminder.content,
                            },
                        ],
                    },
                ],
            };

            if (user.webhookID) {
                const webhook = await this.webhooks.get(user.webhookID);
                if (!webhook) {
                    await this.reminders.delete(reminder.id);
                    continue;
                }

                await this.bot.executeWebhook(webhook.id, webhook.token, message).catch(async () => {
                    const dmChannel = await this.bot.getDMChannel(user.id);
                    if (!dmChannel) return;

                    message.embeds?.push({
                        title: 'Issues with Reminder',
                        color: BotColors.red,
                        description:
                            'This reminder has failed to send to the webhook and defaulted to your DMs. Please check your webhooks.',
                    });

                    await dmChannel.createMessage(message);
                });

                await this.reminders.delete(reminder.id);
            } else if (reminder.channelID) {
                await this.bot.createMessage(reminder.channelID, message).catch(async () => {
                    const dmChannel = await this.bot.getDMChannel(user.id);
                    if (!dmChannel) return;

                    message.embeds?.push({
                        title: 'Issues with Reminder',
                        color: BotColors.red,
                        description:
                            'This reminder has failed to send to the channel and defaulted to your DMs. Please check your permissions.',
                    });

                    await dmChannel.createMessage(message);
                });

                await this.reminders.delete(reminder.id);
            } else {
                const dmChannel = await this.bot.getDMChannel(user.id);
                if (!dmChannel) return;

                message.embeds?.push({
                    title: 'Issues with Reminder',
                    color: BotColors.red,
                    description: 'This reminder has failed to send to the channel and defaulted to your DMs.',
                });

                await dmChannel.createMessage(message);

                await this.reminders.delete(reminder.id);
            }
        }
        this.queueLock = false;
    }
}

import { Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import NotiFyre from '../../Bot';
import { MiddleWareType } from '../../types/MiddleWare';
import { ErrorMessage, MissingPermissionsMessage } from '../../utils/message';
import * as chrono from 'chrono-node';
import moment from 'moment-timezone';
import timestring from 'timestring';
import { BotColors, BotEmojis } from '../../utils/constants';
import { AllPermissions } from '../../types/Permissions';
import { Webhook } from '@prisma/client';

export default class Add extends Command<NotiFyre> {
    id = 'add';
    definition = new CommandBuilder('add', 'Create a reminder')
        .setCommandType(Constants.ApplicationCommandType.ChatInput)
        .setIntegrationTypes([Constants.ApplicationIntegrationType.UserInstall, Constants.ApplicationIntegrationType.GuildInstall])
        .addStringOption({
            name: 'time',
            description: 'When should I remind you?',
            required: true,
        })
        .addStringOption({
            name: 'reminder',
            description: 'What should I remind you about?',
            required: true,
            max_length: 1000,
        });
    async handleCommand(caller: NotiFyre, command: CommandInteraction, commandData: MiddleWareType) {
        try {
            if (!commandData.user) return;
            if (!commandData.user.timezone) {
                return await ErrorMessage(
                    command,
                    'You have not set your timezone. Please use the /timezone command to set your timezone.',
                    true,
                );
            }

            let channelID: string | null = null;
            if (!commandData.user.webhookID) {
                if (!command.guild) {
                    return await ErrorMessage(
                        command,
                        "You don't have a default channel set and I'm not in this server. Either add me to this server, or set a default channel in a server that I'm already in.",
                        true,
                    );
                }

                if (command.channel.isTextBased() && command.channel.inGuild()) {
                    const botPermissions = command.channel.permissionsOf(caller.bot.user.id);
                    const missingPermissions = botPermissions.missing('SendMessages', 'ViewChannel');
                    if (missingPermissions.length) {
                        return MissingPermissionsMessage(command, missingPermissions as AllPermissions[], true);
                    }

                    channelID = command.channel.id;
                }
            }

            let webhook: Webhook | null = null;
            if (!channelID && commandData.user.webhookID) {
                webhook = await caller.database.webhook.get(commandData.user.webhookID);
            }

            let isChrono = true;

            const rawTime = command.getRequiredString('time');
            const reminder = command.getRequiredString('reminder');

            let chronoTime = chrono.parseDate(rawTime);

            if (!chronoTime) {
                isChrono = false;
                try {
                    const time = timestring(rawTime) * 1000;
                    chronoTime = new Date(new Date().getTime() + time + 1000);
                } catch {
                    return await ErrorMessage(command, 'Failed to parse time.\nPlease use a valid time and date.', true);
                }
            }

            let userTime: moment.Moment;
            if (isChrono) {
                userTime = moment(chronoTime).tz(commandData.user.timezone, true);

                const dayDifference = moment().tz(commandData.user.timezone).dayOfYear() - moment().dayOfYear();
                if (Math.abs(dayDifference) > 1) {
                    if (dayDifference > 0) userTime.subtract(1, 'days');
                    else userTime.add(1, 'days');
                } else userTime.add(dayDifference, 'days');
            } else userTime = moment(chronoTime);

            if (userTime.toISOString() < new Date().toISOString()) {
                return await ErrorMessage(command, 'The reminder time has already passed.\nPlease use a future time and date.', true);
            }

            await caller.database.reminder.create({
                user: { connect: { id: commandData.user.id } },
                content: reminder,
                rawTime: rawTime,
                endsAt: userTime.toDate(),
                recurring: false,
                channelID: channelID,
            });

            await command.createMessage({
                embeds: [
                    {
                        title: `Success ${BotEmojis.greenTick.full}`,
                        description: channelID
                            ? `Reminder will be sent to here: <#${channelID}>.`
                            : `Reminder will be sent to your preferred channel: <#${webhook?.channelID}>.`,
                        color: BotColors.notifyre,
                        fields: [
                            {
                                name: 'Time to Remind',
                                value: `<t:${userTime.unix()}:f>`,
                                inline: true,
                            },
                            {
                                name: 'Remaining Time',
                                value: `<t:${userTime.unix()}:R>`,
                                inline: true,
                            },
                            {
                                name: 'Reminder',
                                value: reminder,
                            },
                        ],
                    },
                ],
                flags: Constants.MessageFlags.Ephemeral,
            });
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

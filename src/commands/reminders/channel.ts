import { Command, CommandBuilder, CommandInteraction, Constants } from 'athena';
import NotiFyre from '../../Bot';
import { ConfirmAction, ErrorMessage, MissingPermissionsMessage } from '../../utils/message';
import { MiddleWareType } from '../../types/MiddleWare';
import { BotColors, BotEmojis } from '../../utils/constants';
import { AllPermissions } from '../../types/Permissions';

export default class Channel extends Command<NotiFyre> {
    id = 'channel';
    definition = new CommandBuilder('channel', 'Set a channel for reminders to go to by default.')
        .setCommandType(Constants.ApplicationCommandType.ChatInput)
        .setMemberPermission(Constants.PermissionFlagsBits.ManageChannels | Constants.PermissionFlagsBits.ManageWebhooks)
        .setContexts([Constants.InteractionContextType.Guild])
        .addSubcommand('set', 'Set a channel for reminders to go to by default.', (sub) => {
            sub.addChannelOption('channel', 'The channel to set as the default channel for reminders.', true, [
                Constants.ChannelType.GuildText,
            ]);
        })
        .addSubcommand('remove', 'Remove the default channel for reminders.');

    async handleCommand(caller: NotiFyre, command: CommandInteraction, commandData: MiddleWareType) {
        try {
            const user = command.member ? command.member.user : command.user;
            if (!user) return ErrorMessage(command, 'Failed to get user information. Please try again.', true);

            switch (command.subcommand) {
                case 'set': {
                    const channel = command.getRequiredChannel('channel');
                    const inUseChannel = await caller.database.webhook.getByChannel(channel.id);
                    if (inUseChannel) {
                        if (inUseChannel.id != commandData.user?.webhookID) {
                            if (commandData.user?.webhookID) await caller.parsing.deleteWebhookCheck(commandData.user);
                            await caller.database.user.update(user.id, { webhook: { connect: { id: inUseChannel.id } } });
                        }
                    } else if (channel?.isTextBased() && channel.inGuild()) {
                        const botPermissions = channel.permissionsOf(caller.bot.user.id);
                        const missingPermissions = botPermissions.missing('ManageWebhooks', 'ViewChannel');
                        if (missingPermissions.length) {
                            return MissingPermissionsMessage(command, missingPermissions as AllPermissions[], true);
                        }

                        if (commandData.user?.webhookID) await caller.parsing.deleteWebhookCheck(commandData.user);

                        const webhook = await caller.bot.createChannelWebhook(channel.id, {
                            name: 'NotiFyre | Reminder',
                            avatar: caller.utils.createWebhookAvatar(),
                        });
                        if (!webhook.token) return ErrorMessage(command, 'Failed to create webhook for channel. Please try again.', true);

                        await caller.database.webhook.create({
                            id: webhook.id,
                            token: webhook.token,
                            channelID: channel.id,
                        });
                        await caller.database.user.update(user.id, { webhook: { connect: { id: webhook.id } } });
                    }

                    await command.createMessage({
                        embeds: [
                            {
                                title: `Set Default Channel`,
                                description: `The default channel for reminders has been set to <#${channel.id}>.`,
                                color: BotColors.notifyre,
                            },
                        ],
                        flags: Constants.MessageFlags.Ephemeral,
                    });
                    break;
                }
                case 'remove': {
                    if (!commandData.user?.webhookID) return ErrorMessage(command, 'No default channel set.', true);

                    const check = await ConfirmAction(caller, command, {
                        embeds: [
                            {
                                title: 'Remove Default Channel',
                                description: 'Are you sure you want to remove the default channel for reminders?',
                                color: BotColors.notifyre,
                            },
                        ],
                        flags: Constants.MessageFlags.Ephemeral,
                    });
                    if (check.timeout) {
                        return command.editOriginalMessage({
                            embeds: [
                                {
                                    title: `Remove Default Channel: Timed Out ${BotEmojis.yellowBang.full}`,
                                    description: 'You took too long to respond. The request has been cancelled.',
                                    color: BotColors.yellow,
                                },
                            ],
                            components: [],
                        });
                    }

                    const confirmation = check.result;
                    if (confirmation) {
                        await caller.parsing.deleteWebhookCheck(commandData.user);
                        await caller.database.user.update(user.id, { webhook: { disconnect: true } });
                    }

                    return command.editOriginalMessage({
                        embeds: [
                            {
                                title: `Remove Default Channel: ${confirmation ? `Success ${BotEmojis.greenTick.full}` : `Cancelled ${BotEmojis.redX.full}`} `,
                                description: confirmation
                                    ? 'The default channel for reminders has been removed.'
                                    : 'The request to remove the default channel has been cancelled.',
                                color: confirmation ? BotColors.notifyre : BotColors.red,
                            },
                        ],
                        components: [],
                    });
                }
            }
        } catch (error) {
            caller.parsing.commandError(error);
        }
    }
}

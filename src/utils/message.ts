import { CommandInteraction, ComponentBuilder, ComponentInteraction, Constants, Message, ModalSubmitInteraction } from 'athena';
import NotiFyre from '../Bot';
import { BotColors, BotEmojis, BotPermissions } from './constants';
import { AllPermissions } from '../types/Permissions';
import { MessageReplyContent } from '../types/MessageTypes';

type MessageContent =
    | string
    | (Constants.RESTPostAPIChannelMessageJSONBody & {
          embed?: Constants.APIEmbed | undefined;
      });

export const StatusMessage = async (caller: NotiFyre, content: MessageContent) => {
    return await caller.bot.createMessage(caller.config.CHANNEL.STATUS, content);
};

export const SuccessMessage = async (
    command: CommandInteraction | ModalSubmitInteraction | ComponentInteraction,
    content: string,
    ephemeral = false,
) => {
    await command.createMessage({
        embeds: [
            {
                title: 'Success ' + BotEmojis.greenTick.full,
                description: content,
                color: BotColors.green,
            },
        ],
        flags: ephemeral ? Constants.MessageFlags.Ephemeral : undefined,
    });
};

export const ErrorMessage = async (
    command: CommandInteraction | ModalSubmitInteraction | ComponentInteraction,
    content: string,
    ephemeral = false,
) => {
    await command.createMessage({
        embeds: [
            {
                title: 'Error ' + BotEmojis.redX.full,
                description: content,
                color: BotColors.orange,
            },
        ],
        flags: ephemeral ? Constants.MessageFlags.Ephemeral : undefined,
    });
};

export const MissingPermissionsMessage = async (
    command: CommandInteraction | ComponentInteraction,
    missingPermissions: AllPermissions[],
    ephemeral = false,
) => {
    await command.createMessage({
        embeds: [
            {
                title: 'Missing Permissions',
                description: `The bot is missing the following permissions:`,
                color: BotColors.orange,
                fields: missingPermissions.map((permission, index) => {
                    if (missingPermissions.length > 1) index = index + 1;
                    return {
                        name: (index ? `${index}. ` : '') + BotPermissions[permission].name,
                        value: BotPermissions[permission].description,
                    };
                }),
            },
        ],
        flags: ephemeral ? Constants.MessageFlags.Ephemeral : undefined,
    });
};

export const Pagination = async (
    caller: NotiFyre,
    pages: (string | Omit<Constants.APIEmbed, 'type'>)[],
    command: CommandInteraction,
    userID: string,
    count = false,
    full = false,
    ephemeral = false,
) => {
    let currentPage = 0;
    let message: Message | void | undefined;
    const flags = ephemeral ? Constants.MessageFlags.Ephemeral : undefined;
    if (pages.length == 1) {
        if (typeof pages[0] === 'string') return (message = await command.createMessage({ content: pages[0], flags }));
        else return (message = await command.createMessage({ embeds: [pages[0]], flags }));
    }

    const row = new ComponentBuilder()
        .addActionRow((b) => {
            if (full)
                b.addNormalButton({
                    label: '<<',
                    style: Constants.ButtonStyle.Primary,
                    custom_id: 'first',
                });
            b.addNormalButton({
                label: '<',
                style: Constants.ButtonStyle.Primary,
                custom_id: 'back',
            });
            b.addNormalButton({
                label: count ? `Page 1/${pages.length}` : 'X',
                style: count ? Constants.ButtonStyle.Secondary : Constants.ButtonStyle.Danger,
                custom_id: 'delete',
                disabled: count,
            });
            b.addNormalButton({
                label: '>',
                style: Constants.ButtonStyle.Primary,
                custom_id: 'next',
            });
            if (full)
                b.addNormalButton({
                    label: '>>',
                    style: Constants.ButtonStyle.Primary,
                    custom_id: 'last',
                });
        })
        .toJSON();

    if (typeof pages[0] === 'string')
        message = await command.createMessage({
            content: pages[0],
            components: row,
            flags,
        });
    else message = await command.createMessage({ embeds: [pages[0]], components: row, flags });
    message = await command.getOriginalMessage();
    if (!message) return;

    let timer: NodeJS.Timeout;

    const handler = async (interaction: ComponentInteraction) => {
        const interactionUserID = interaction.member?.user?.id ?? interaction.user?.id;
        if (interaction.type != 3) return;
        if (!['first', 'back', 'delete', 'next', 'last'].includes(interaction.data.custom_id)) return;
        if (interaction.message?.id !== message?.id || interactionUserID !== userID) return;
        if (!interaction.acknowledged) await interaction.deferUpdate().catch(() => {});
        switch (interaction.data.custom_id) {
            case 'first':
                currentPage = 0;
                break;
            case 'back':
                currentPage -= 1;
                if (currentPage < 0) currentPage = 0;
                break;
            case 'delete':
                interaction.deleteOriginalMessage().catch(() => {});
                clearTimeout(timer);
                // @ts-ignore -- typescript being off lol
                caller.bot.off('interactionCreate', handler);
                return;
            case 'next':
                currentPage += 1;
                if (currentPage > pages.length - 1) currentPage = pages.length - 1;
                break;
            case 'last':
                currentPage = pages.length - 1;
                break;
        }

        if (count) {
            //@ts-ignore -- This can only ever be a button, no specific types for buttons
            if (!full) row[0].components[1].label = `Page ${currentPage + 1}/${pages.length}`;
            //@ts-ignore
            else row[0].components[2].label = `Page ${currentPage + 1}/${pages.length}`;
        }

        if (typeof pages[currentPage] === 'string') {
            await interaction.editOriginalMessage({
                content: pages[currentPage] as string,
                embeds: [],
                components: row,
            });
        } else {
            await interaction.editOriginalMessage({
                content: '',
                embeds: [pages[currentPage]] as Constants.APIEmbed[],
                components: row,
            });
        }
    };

    // @ts-ignore -- typescript again
    caller.bot.on('interactionCreate', handler);

    timer = setTimeout(async () => {
        // @ts-ignore -- typescript again
        caller.bot.off('interactionCreate', handler);
        if (!ephemeral) await message.edit({ components: [] });
    }, 180 * 1000);

    return message;
};

export const ConfirmAction = async (
    caller: NotiFyre,
    command: CommandInteraction | ModalSubmitInteraction | ComponentInteraction,
    reply: MessageReplyContent,
    time = 60,
    edit = false,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
): Promise<{ result: boolean; timeout?: boolean; message: Message }> =>
    new Promise(async (resolve) => {
        const row = new ComponentBuilder()
            .addActionRow((b) => {
                b.addNormalButton({
                    label: confirmText,
                    custom_id: 'confirm',
                    style: Constants.ButtonStyle.Success,
                }).addNormalButton({
                    label: cancelText,
                    custom_id: 'cancel',
                    style: Constants.ButtonStyle.Danger,
                });
            })
            .toJSON();

        if (typeof reply !== 'string') {
            reply.components = row;
        } else {
            reply = {
                content: reply,
                components: row,
            };
        }

        // Send the message
        let message = edit ? await command.editParent(reply) : await command.createMessage(reply);
        message = await command.getOriginalMessage();
        if (!message) return;

        let timeout: NodeJS.Timeout;

        const handler = async (interaction: ComponentInteraction) => {
            if (interaction.type != 3) return;
            if (!['confirm', 'cancel'].includes(interaction.data.custom_id)) return;
            if (interaction.message?.id !== message.id || interaction.member?.user?.id !== command.member?.id)
                return interaction.deferUpdate();
            if (!interaction.acknowledged) await interaction.deferUpdate().catch(() => {});

            // Remove button that wasn't pressed, and disable the one that was
            row[0].components = row[0].components.filter((button) => {
                if ('custom_id' in button) return button.custom_id == interaction.data.custom_id;
                else return true;
            });

            row[0].components.forEach((button) => {
                button.disabled = true;
            });

            await interaction.editOriginalMessage({ components: row }).catch(() => {});

            // @ts-ignore yea
            caller.bot.off('interactionCreate', handler);
            if (timeout) clearTimeout(timeout);

            if (interaction.data.custom_id == 'confirm') return resolve({ result: true, message });
            else return resolve({ result: false, message });
        };

        // @ts-ignore yea
        caller.bot.on('interactionCreate', handler);

        // set a timeout
        timeout = setTimeout(async () => {
            // @ts-ignore yea
            caller.bot.off('interactionCreate', handler);
            if (message.flags.bits !== BigInt(64)) await message.edit({ components: [] }).catch(() => {});
            return resolve({ result: false, timeout: true, message });
        }, time * 1000);
    });

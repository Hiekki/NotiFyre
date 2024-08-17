import { AllPermissions } from '../../types/Permissions';

export const BotColors = {
    notifyre: 15488008,
    embedGray: 2829617,
    green: 5690368,
    red: 16722730,
    yellow: 16768341,
    limeGreen: 2162432,
    orange: 15490071,
    white: 15987699,
    blurple: 7506394,
    aqua: 6217719,
    black: 0,
    blue: 4825087,
    darkGreen: 3372054,
    grey: 13421772,
    nitroPink: 16023551,
    sharkleberryFin: 16720194,
    zendeskBlue: 79419,
    hydraGreen: 2275133,
};

export const BotEmojis = {
    greenTick: {
        full: '<:greenTick:1250204318595023011>',
        partial: 'greenTick:1250204318595023011',
    },
    redX: {
        full: '<:redX:1250204319685414953>',
        partial: 'redX:1250204319685414953',
    },
    yellowBang: {
        full: '<:yellowBang:1250204320666746923>',
        partial: 'yellowBang:1250204320666746923',
    },
};

export const BotPermissions: Record<AllPermissions, { name: string; description: string }> = {
    //* General Server Permissions
    ViewChannel: {
        name: 'View Channel',
        description: 'Allows the bot to view the channel.',
    },
    ManageChannels: {
        name: 'Manage Channels',
        description: 'Allows the bot to create, edit, or delete channels.',
    },
    ManageRoles: {
        name: 'Manage Roles',
        description:
            "Allows the bot to create new roles and edit or delete roles lower than it's highest role. Also allows the bot to change permissions of individual channels that they have access to.",
    },
    CreateGuildExpressions: {
        name: 'Create Guild Expressions',
        description: 'Allows the bot to add custom emojis, stickers, and sounds in this server.',
    },
    ManageGuildExpressions: {
        name: 'Manage Guild Expressions',
        description: 'Allows the bot to edit or remove custom emojis, stickers, and sounds in this server.',
    },
    ViewAuditLog: {
        name: 'View Audit Log',
        description: 'Allows the bot to view a record of who made which changes in this server.',
    },
    ViewGuildInsights: {
        name: 'View Guild Insights',
        description:
            'Allows the bot to view Server Insights, which shows data on community growth, engagement, and more. This will allow the bot to see certain data about channel activity, even for channels it cannot access.',
    },
    ManageWebhooks: {
        name: 'Manage Webhooks',
        description:
            'Allows the bot to create, edit, and delete webhooks, which can post messages from other apps or sites into this server.',
    },
    ManageGuild: {
        name: 'Manage Guild',
        description:
            "Allows the bot to change this server's name, switch regions, view all invites, add apps to this server, and create and update AutoMod rules.",
    },

    //* Membership Permissions
    CreateInstantInvite: {
        name: 'Create Instant Invite',
        description: 'Allows the bot to invite new people to this server.',
    },
    ChangeNickname: {
        name: 'Change Nickname',
        description: "Allows the bot to change it's own nickname for just this server.",
    },
    ManageNicknames: {
        name: 'Manage Nicknames',
        description: 'Allows the bot to change the nicknames of other members in this server.',
    },
    KickMembers: {
        name: 'Kick Members',
        description:
            'Allows the bot to remove other members from this server. Kicked members will be able to rejoin if they have another invite.',
    },
    BanMembers: {
        name: 'Ban Members',
        description: 'Allows the bot to permanently ban and delete the message history of other members from this server.',
    },
    //TODO: TimeoutMembers ??

    //* Text Channel Permissions
    SendMessages: {
        name: 'Send Messages',
        description: 'Allows the bot to send messages in text channels.',
    },
    SendMessagesInThreads: {
        name: 'Send Messages in Threads',
        description: 'Allows the bot to send messages in threads.',
    },
    CreatePublicThreads: {
        name: 'Create Public Threads',
        description: 'Allows the bot to create threads that everyone in a channel can view.',
    },
    CreatePrivateThreads: {
        name: 'Create Private Threads',
        description: 'Allows the bot to create invite-only threads.',
    },
    EmbedLinks: {
        name: 'Embed Links',
        description: 'Allows the bot to share links to show embedded content in text channels.',
    },
    AttachFiles: {
        name: 'Attach Files',
        description: 'Allows the bot to upload files or media in text channels.',
    },
    AddReactions: {
        name: 'Add Reactions',
        description:
            'Allows the bot to add new emoji reactions to a message. If this permission is disabled, members can still react using any existing reactions on a message.',
    },
    UseExternalEmojis: {
        name: 'Use External Emojis',
        description: 'Allows the bot to use emojis from other servers.',
    },
    UseExternalStickers: {
        name: 'Use External Stickers',
        description: 'Allows the bot to use stickers from other servers.',
    },
    MentionEveryone: {
        name: 'Mention Everyone',
        description: `Allows the bot to use @everyone (everyone in the server) and @here (only online members in that channel). They can also @mention all roles, even it the role's "Allow anything to mention this role" is disabled.`,
    },
    ManageMessages: {
        name: 'Manage Messages',
        description: 'Allows the bot to delete messages by other members or pin any message.',
    },
    ManageThreads: {
        name: 'Manage Threads',
        description: 'Allows the bot to rename, delete, close, and turn on slow mode for threads. They can also view private threads.',
    },
    ReadMessageHistory: {
        name: 'Read Message History',
        description:
            'Allows the bot to read previous messages sent in channels. If this permissions is disabled, the bot will only see messages sent when they are online and focused on that channel.',
    },
    SendTTSMessages: {
        name: 'Send Text-to-Speech Messages',
        description: 'Allows the bot to send text-to-speech messages. These messages can be heard by anyone focused on the channel.',
    },
    SendVoiceMessages: {
        name: 'Send Voice Messages',
        description: 'Allows the bot to send voice messages.',
    },
    SendPolls: {
        name: 'Send Polls',
        description: 'Allows the bot to create polls.',
    },

    //* Voice Channel Permissions
    Connect: {
        name: 'Connect',
        description: 'Allows the bot to join voice channels and hear others.',
    },
    Speak: {
        name: 'Speak',
        description:
            'Allows the bot to talk in voice channels. If this permission is disabled, the bot will be defaulted to muted until someone with the "Mute Members" permission un-mutes it.',
    },
    //TODO: Video ??
    UseSoundboard: {
        name: 'Use Soundboard',
        description: 'Allows the bot to send sounds from the server soundboard.',
    },
    UseExternalSounds: {
        name: 'Use External Sounds',
        description: 'Allows the bot to use sounds from other servers.',
    },
    PrioritySpeaker: {
        name: 'Priority Speaker',
        description: 'Allows the bot to be more easily heard in voice channels.',
    },
    MuteMembers: {
        name: 'Mute Members',
        description: 'Allows the bot to mute other members in voice channels for everyone.',
    },
    DeafenMembers: {
        name: 'Deafen Members',
        description: "Allows the bot to deafen other members in voice channels, which means they won't be able to hear others.",
    },
    MoveMembers: {
        name: 'Move Members',
        description: 'Allows the bot to disconnect or move members between voice channels that the bot has access to.',
    },
    //TODO: SetVoiceChannelStatus ??

    //* Apps Permissions
    UseApplicationCommands: {
        name: 'Use Application Commands',
        description: 'Allows the bot to use commands from applications, including slash commands and context menu commands.',
    },
    UseEmbeddedActivities: {
        name: 'Use Embedded Activities',
        description: 'Allows the bot to use Activities.',
    },
    UseExternalApps: {
        name: 'Use External Apps',
        description: 'Allows the bot to use external apps.',
    },

    //* Stage Channel Permissions
    RequestToSpeak: {
        name: 'Request to Speak',
        description: 'Allows the bot to request to speak in Stage channels. Stage moderators manually approve or deny each request.',
    },

    //* Event Permissions
    CreateEvents: {
        name: 'Create Events',
        description: 'Allows the bot to create events.',
    },
    ManageEvents: {
        name: 'Manage Events',
        description: 'Allows the bot to edit and cancel events.',
    },

    //* Advanced Permissions
    Administrator: {
        name: 'Administrator',
        description:
            'With this permission, the bot will have every permission and will also bypass all channel specific permissions or restrictions.',
    },
};

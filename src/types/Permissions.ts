import { Constants } from 'athena';

type ExcludedPermissions = 'ManageEmojisAndStickers' | 'ModerateMembers' | 'Stream' | 'UseVAD' | 'ViewCreatorMonetizationAnalytics';

const excludedPermissions: ExcludedPermissions[] = [
    'ManageEmojisAndStickers',
    'ModerateMembers',
    'Stream',
    'UseVAD',
    'ViewCreatorMonetizationAnalytics',
];

const allPermissions = (Object.keys(Constants.PermissionFlagsBits) as (keyof typeof Constants.PermissionFlagsBits)[]).filter(
    (permission): permission is Exclude<keyof typeof Constants.PermissionFlagsBits, ExcludedPermissions> =>
        !excludedPermissions.includes(permission as ExcludedPermissions),
);

export type AllPermissions = (typeof allPermissions)[number];

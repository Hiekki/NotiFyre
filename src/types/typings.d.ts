declare module 'parse-human-relative-time' {
    import type { DateTime } from 'luxon';
    function parseHumanRelativeTime(str: string, now?: DateTime): DateTime;
    export default function createParse(luxon: typeof DateTime): parseHumanRelativeTime;
}

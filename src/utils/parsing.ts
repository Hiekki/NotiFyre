import { Command } from 'athena';
import NotiFyre from '../Bot';
import moment, { Duration } from 'moment';
import { DateTime } from 'luxon';
import ParseTime from 'parse-human-relative-time';
import timestring from 'timestring';
import { parse, ParsedResult } from 'chrono-node';
import { User } from '@prisma/client';

export default class Parsing {
    caller: NotiFyre;
    config: NotiFyre['config'];
    logger: NotiFyre['logger'];

    constructor(caller: NotiFyre) {
        this.caller = caller;
        this.config = caller.config;
        this.logger = caller.logger;
    }

    commandError(error: Error | string | unknown, command?: Command<NotiFyre>) {
        this.logger.error(error);
    }

    parseID(content: string) {
        return content?.replace(/\D+/g, '');
    }

    snowflakeDate(resourceID: string) {
        return new Date(parseInt(resourceID, 10) / 4194304 + 1420070400000);
    }

    sanitize(content: string, mentions = true) {
        content = content
            .replace(/~/g, '\u200B~')
            .replace(/\*/g, '\u200B*')
            .replace(/_/g, '\u200B_')
            .replace(/`/g, '\u02CB')
            .replace(/\|/g, '\u200B|');
        if (mentions) content = content.replace(/@/g, '@\u200B').replace(/#/g, '#\u200B');
        return content;
    }

    unix(date?: Date) {
        return Math.floor((date ? date.getTime() : Date.now()) / 1000);
    }

    parseTime(t: string) {
        let d = new Date();
        let time = t.match(/(\d+)(?::(\d\d))?\s*(p?)/);
        if (!time) return null;
        d.setHours(parseInt(time[1]) + (time[3] ? 12 : 0));
        d.setMinutes(parseInt(time[2]) || 0);
        return d;
    }

    accountAge(timestamp: Date | number) {
        const creation = moment(timestamp);
        const current = moment(new Date().toISOString());
        const duration = moment.duration(current.diff(creation));

        return this.getTimestampString(duration);
    }

    remainingTime(timestamp: Date) {
        const future = moment(timestamp);
        const current = moment(new Date().toISOString());
        const duration = moment.duration(future.diff(current));
        if (duration.milliseconds() < 0) {
            duration.add(24, 'hours');
        }

        return this.getTimestampString(duration);
    }

    timestamp(timestamp: Date | number) {
        let future = moment(timestamp);
        const current = moment(new Date().toISOString());
        const duration = moment.duration(future.diff(current));
        if (duration.milliseconds() < 0) {
            future = moment(timestamp).add(24, 'hours');
        }

        return future.toDate();
    }

    getTimestampString(duration: Duration) {
        const years = duration.years();
        const months = duration.months();
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        let age = '';

        if (years) age = `${years}Y `;
        if (months) age += `${months}M `;
        if (days && !years) age += `${days}D `;
        if (hours && !months) age += `${hours}h `;
        if (minutes && !days) age += `${minutes}m `;
        if (seconds && !hours) age += `${seconds}s`;

        return age.trim();
    }

    time(time: string, tz: string = 'UTC'): DateTime {
        let output: DateTime | null = null;
        const now = DateTime.now().setZone(tz);

        try {
            const relative = timestring(time, 'ms');
            output = now.plus({ millisecond: relative });
        } catch (error) {
            // failed to parse relative but we don't care
        }

        if (!output) {
            try {
                const parser = ParseTime(DateTime);
                output = parser(time, now);
            } catch (error) {
                // failed to parse
                throw error;
            }
        }

        const diff = output!.toUnixInteger() - now.toUnixInteger();
        if (diff <= -(24 * 60 * 60)) throw new TypeError('Date is more than one day in the past');
        if (diff < 0) output = output!.plus({ days: 1 });

        return output!;
    }

    async deleteWebhookCheck(user: User) {
        if (!user.webhookID) return;
        const usersWithWebhooks = await this.caller.database.user.getAllWebhooks(user.webhookID);
        if (usersWithWebhooks.length == 1) {
            await this.caller.bot
                .deleteWebhook(user.webhookID, undefined, `Changing default reminder channel for ${user.name}.`)
                .catch(() => {});
            await this.caller.database.webhook.delete(user.webhookID);
        }
    }
}

import IORedis from 'ioredis';

export default class CoolDown {
    private redis: IORedis;

    constructor(redis: IORedis) {
        this.redis = redis;
    }

    set(command: string, seconds: number, userID: string) {
        this.redis.setex(`CoolDown:${command}:${userID}`, seconds, new Date().getTime() + seconds * 1000);
    }

    get(command: string, userID: string) {
        return this.redis.get(`CoolDown:${command}:${userID}`);
    }
}

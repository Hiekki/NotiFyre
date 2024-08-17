import { PrismaClient, Prisma, Guild as GuildModel } from '@prisma/client';

export default class Guild {
    db: PrismaClient;
    constructor(db: PrismaClient) {
        this.db = db;
    }

    create(data: Prisma.GuildCreateInput) {
        return this.db.guild.create({ data });
    }

    get(guildID: GuildModel['guildID']) {
        return this.db.guild.findUnique({ where: { guildID } });
    }

    all() {
        return this.db.guild.findMany();
    }

    update(guildID: GuildModel['guildID'], data: Prisma.GuildUpdateInput) {
        return this.db.guild.update({ where: { guildID }, data });
    }

    delete(guildID: GuildModel['guildID']) {
        return this.db.guild.delete({ where: { guildID } });
    }
}

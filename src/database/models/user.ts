import { Prisma, PrismaClient, User as UserModel } from '@prisma/client';

export default class User {
    db: PrismaClient;

    constructor(db: PrismaClient) {
        this.db = db;
    }

    create(data: Prisma.UserCreateInput) {
        return this.db.user.create({ data });
    }

    get(id: UserModel['id']) {
        return this.db.user.findUnique({ where: { id } });
    }

    getUserWithWebhook(id: UserModel['id'], reminders: boolean = false) {
        return this.db.user.findUnique({ where: { id }, include: { webhook: true, reminders } });
    }

    getAllWebhooks(webhookID: UserModel['webhookID']) {
        return this.db.user.findMany({ where: { webhookID } });
    }

    update(id: UserModel['id'], data: Prisma.UserUpdateInput) {
        return this.db.user.update({ where: { id }, data });
    }

    delete(id: UserModel['id']) {
        return this.db.user.delete({ where: { id } });
    }
}

import { PrismaClient, Prisma, Webhook as WebhookModel } from '@prisma/client';

export default class Webhook {
    db: PrismaClient;
    constructor(db: PrismaClient) {
        this.db = db;
    }

    create(data: Prisma.WebhookCreateInput) {
        return this.db.webhook.create({ data });
    }

    get(id: WebhookModel['id']) {
        return this.db.webhook.findUnique({ where: { id } });
    }

    getByChannel(channelID: WebhookModel['channelID']) {
        return this.db.webhook.findFirst({ where: { channelID } });
    }

    delete(id: WebhookModel['id']) {
        return this.db.webhook.delete({ where: { id } });
    }
}

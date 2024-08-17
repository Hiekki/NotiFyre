import { PrismaClient, Prisma, Reminder as ReminderModel } from '@prisma/client';

export default class Reminder {
    db: PrismaClient;
    all: All;

    constructor(db: PrismaClient) {
        this.db = db;
        this.all = new All(this.db);
    }

    create(data: Prisma.ReminderCreateInput) {
        return this.db.reminder.create({ data });
    }

    get(id: ReminderModel['id']) {
        return this.db.reminder.findUnique({ where: { id } });
    }

    update(id: ReminderModel['id'], data: Prisma.ReminderUpdateInput) {
        return this.db.reminder.update({ where: { id }, data });
    }

    delete(id: ReminderModel['id']) {
        return this.db.reminder.update({ where: { id }, data: { active: false } });
    }
}

class All {
    db: PrismaClient;
    constructor(db: PrismaClient) {
        this.db = db;
    }

    fetch() {
        return this.db.reminder.findMany();
    }

    user(userID: ReminderModel['userID']) {
        return this.db.reminder.findMany({ where: { userID, active: true } });
    }

    active() {
        return this.db.reminder.findMany({ where: { active: true } });
    }

    expired() {
        return this.db.reminder.findMany({ where: { active: true, endsAt: { lte: new Date() } } });
    }
}

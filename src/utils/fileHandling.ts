import path from 'path';
import fs from 'fs';
import url from 'url';
import EventBase from '../types/EventBase';
import { Command } from 'athena';
import NotiFyre from '../Bot';

export const loadCommands = async (commandsPath: string) => {
    const files = fs.readdirSync(commandsPath);
    let resolved: Map<string, Command<NotiFyre>> = new Map<string, Command<NotiFyre>>();
    for (const file of files) {
        const res = await discoverFiles<Command<NotiFyre>>(commandsPath, file, [], (file, item) => item.command || item.definition!.name);
        resolved = new Map<string, Command<NotiFyre>>([...resolved, ...res]);
    }
    return resolved;
};

export const loadEvents = async (eventsPath: string) => {
    const files = fs.readdirSync(eventsPath);
    let resolved: Map<string, EventBase> = new Map<string, EventBase>();
    for (const file of files) {
        const res = await discoverFiles<EventBase>(eventsPath, file, [], (file) => file);
        resolved = new Map<string, EventBase>([...resolved, ...res]);
    }
    return resolved;
};

type NameFunc<T> = (file: string, item: T) => string;

const discoverFiles = async <T>(commandsPath: string, file: string, modulePath: string[], nameFunc: NameFunc<T>) => {
    let resolved: Map<string, T> = new Map<string, T>();

    const fileURL = url.pathToFileURL(path.join(commandsPath, file));
    const fileStats = fs.statSync(fileURL);

    if (fileStats.isDirectory()) {
        const items = fs.readdirSync(fileURL);
        modulePath.push(file);
        for (const item of items) {
            const res = await discoverFiles<T>(path.join(commandsPath, file), item, modulePath, nameFunc);
            resolved = new Map<string, T>([...resolved, ...res]);
        }
        modulePath.pop();
    } else {
        const module = await loadModule<T>(path.join(commandsPath, file));
        if (module) resolved.set(`${modulePath.join('/')}/${nameFunc(file, module)}`, module);
    }
    return resolved;
};

const loadModule = async <T>(path: string) => {
    if (path.includes('template')) return null;
    let hasRequire = false;
    try {
        if (require) {
            hasRequire = true;
            delete require.cache[require.resolve(path)];
        }
    } catch (e) {}

    try {
        const Module = await import(hasRequire ? path : url.pathToFileURL(path).href);
        const module: T = new Module.default();
        return module;
    } catch (error) {
        console.error('Error Loading Module...');
        console.error(error);
        return null;
    }
};

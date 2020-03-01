import { browser } from "webextension-polyfill-ts";

const key = {
    snapshotDates: "snapshotDates",
    selectedSnapshotDate: "selectedSnapshotDate",
    
	snapshotPrefix: "snapshot.",
	snapshot: (date: Date) => "snapshot." + date.getTime()
};

class SyncStorage {
    public async getSnapshotDates(): Promise<Date[]> {
        return this.getSnapshotDateTimes()
            .then(times => times.map(n => new Date(n)));
    }

    public async getSnapshot<TSnapshot>(date: Date): Promise<TSnapshot | undefined> {
        const snapshotKey = key.snapshot(date);
        const storageItems = await browser.storage.sync.get(snapshotKey);

        return storageItems[snapshotKey];
    }

    public async addSnapshot<TSnapshot>(snapshot: TSnapshot): Promise<Date> {
        const date = new Date();

        const snapshotDateTimes = await this.getSnapshotDateTimes();
        snapshotDateTimes.push(date.getTime());

        const snapshotKey = key.snapshot(date);

        await browser.storage.sync.set({
            [key.snapshotDates]: snapshotDateTimes,
            [snapshotKey]: snapshot
        });

        return date;
    }

    public async setSelectedSnapshotDate(date: Date | null) {
        return await browser.storage.sync.set({ [key.selectedSnapshotDate]: date === null ? null : date.getTime() });
    }

    public async getSelectedSnapshotDate(): Promise<Date | null> {
        const storageItems = await browser.storage.sync.get(key.selectedSnapshotDate);
        return storageItems[key.selectedSnapshotDate] ? new Date(storageItems[key.selectedSnapshotDate]) : null;
    }

    private async getSnapshotDateTimes(): Promise<number[]> {
        const storageItems = await browser.storage.sync.get(key.snapshotDates);

        return (storageItems[key.snapshotDates] ?? []) as number[];
    }
}

export const storage = new SyncStorage();

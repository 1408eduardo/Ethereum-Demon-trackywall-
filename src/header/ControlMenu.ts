import styles from "../main.scss";
import { browser } from "webextension-polyfill-ts";
import { SnapshotList } from "./SnapshotList";
import { SnapshotItem } from "./SnapshotItem";
import { SyncEvent } from "ts-events";

export class ControlMenu {
    private readonly menuElement: HTMLElement;
    private open: boolean = false;

    public readonly buttonElement: HTMLElement;
    public readonly buttonLogoElement: HTMLElement;
    public readonly snapshotList: SnapshotList;
    public readonly cancelCompareButton: HTMLElement;
    public readonly createSnapshotButton: HTMLElement;
    public readonly onCreateSnapshotRequest = new SyncEvent<void>();
    public readonly onSelectedSnapshotDateChange = new SyncEvent<Date | null>();

    constructor() {
        document.body.onclick = e => this.onBodyClick(e);

        this.buttonElement = document.createElement("div");
        this.buttonElement.classList.add(styles.controlMenuButton);
        this.buttonElement.onclick = e => this.toggleMenuOpen();

        this.buttonLogoElement = document.createElement("div");
        this.buttonLogoElement.classList.add(styles.controlMenuLogo);
        this.buttonLogoElement.classList.add("i-head-button");
        this.buttonLogoElement.style.backgroundImage = `url("${browser.runtime.getURL("images/header_icon.png")}")`;
        this.buttonElement.appendChild(this.buttonLogoElement);

        this.menuElement = document.createElement("div");
        this.menuElement.className = styles.controlMenu;
        this.buttonElement.appendChild(this.menuElement);

        const menuHeaderElement = document.createElement("header");
        menuHeaderElement.className = styles.controlMenuHeader;
        this.menuElement.appendChild(menuHeaderElement);

        this.createSnapshotButton = document.createElement("div");
        this.createSnapshotButton.textContent = "Create snapshot"
        this.createSnapshotButton.classList.add(styles.controlMenuHeaderButton, styles.createIcon);
        this.createSnapshotButton.onclick = () => this.onCreateSnapshotRequest.post();
        menuHeaderElement.appendChild(this.createSnapshotButton);

        this.cancelCompareButton = document.createElement("div");
        this.cancelCompareButton.textContent = "Cancel compare";
        this.cancelCompareButton.classList.add(styles.controlMenuHeaderButton, styles.cancelIcon);
        this.cancelCompareButton.onclick = () => this.selectedSnapshotDate = null;
        menuHeaderElement.appendChild(this.cancelCompareButton);

        this.snapshotList = new SnapshotList();
        this.menuElement.appendChild(this.snapshotList.element);
    }

    public set selectedSnapshotDate(date: Date | null) {
        this.snapshotList.selectedItem = date ? this.snapshotList.get(date) : null;
        this.onSelectedSnapshotDateChange.post(this.snapshotList.selectedItem?.date ?? null);
    }

    public set snapshotDates(dates: Date[]) {
        this.snapshotList.clear();
        this.snapshotList.add(...dates.map(d => new SnapshotItem(d, i => this.onSnapshotItemClick(i))));
    }

	public addSnapshotDate(date: Date) {
        this.snapshotList.add(new SnapshotItem(date, i => this.onSnapshotItemClick(i)));
    }
    
    private onBodyClick(e: MouseEvent) {
        if (e.target != this.buttonElement && e.target != this.buttonLogoElement)
            this.toggleMenuOpen(false);
    }

    private onSnapshotItemClick(item: SnapshotItem) {
        const oldItem = this.snapshotList.selectedItem;
        
        if (oldItem != (this.snapshotList.selectedItem = item))
            this.onSelectedSnapshotDateChange.post(item.date);
    }

    private toggleMenuOpen(forceOpen?: boolean) {
        const open = forceOpen ?? !this.open;
        if (open === this.open)
            return;
        
        this.open = open;
        this.buttonElement.classList.toggle(styles.controlMenuButtonOpen, open);
        this.menuElement.classList.toggle(styles.controlMenuOpen, open);
    }
}

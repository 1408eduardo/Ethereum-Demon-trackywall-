import { PortfolioListRow } from "./PortfolioListRow";

export class PortfolioListView {
    public static readonly selector: string = "portfolio-list-view";

    private readonly element: Element;
    private readonly rows: PortfolioListRow[];

    constructor(element: Element) {
        if (!element.matches(PortfolioListView.selector))
            throw new Error("Element doesn't match a PortfolioListView.");

        this.element = element;

        this.rows = Array.from(
            element.querySelectorAll("ui-table-body > " + PortfolioListRow.elementSelector),
            elem => new PortfolioListRow(elem));
    }

}
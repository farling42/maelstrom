import { systemBasePath } from "../../settings.js";
import { MaelstromWeaponItem } from "../MaelstromWeaponItem.js";
import { MAELSTROM } from "../../config.js";
export class MaelstromWeaponItemSheet extends ItemSheet {
    /**
     * Define default rendering options for the weapon sheet
     * @return {Object}
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["boilerplate", "sheet", "item"],
            width: 550,
            height: 620,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
        });
    }
    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */
    /**
     * Get the correct HTML template path to use for rendering this particular sheet
     * @type {String}
     */
    get template() {
        return `${systemBasePath}/templates/item/${this.type}Sheet.html`;
    }
    async getData(options) {
        const sheetData = super.getData(options);
        sheetData.data = sheetData.data.system;
        sheetData.attributesList = MAELSTROM.attributes;
        sheetData.enriched_notes = await TextEditor.enrichHTML(sheetData.data.notes);
        // set orderChoices for this item
        sheetData.orderChoices = {};
        const curorder = sheetData.data.order;
        if (curorder > 0)
          sheetData.orderChoices[` ${curorder-6}`] = "MAELSTROM.item.weapon.order.up";
        sheetData.orderChoices[` ${curorder}`] = "MAELSTROM.item.weapon.order.same";
        if (curorder < sheetData.data.lastOrder)
          sheetData.orderChoices[` ${curorder+6}`] = "MAELSTROM.item.weapon.order.down";
        return sheetData;
    }
    get type() {
        return MaelstromWeaponItem.type;
    }
    /** @override */
    setPosition(options = {}) {
        const position = super.setPosition(options);
        const sheetBody = this.element.find(".sheet-body");
        const bodyHeight = position.height - 192;
        sheetBody?.css("height", bodyHeight);
        return position;
    }
    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable)
            return;
        // Roll handlers, click handlers, etc. would go here.
    }
}

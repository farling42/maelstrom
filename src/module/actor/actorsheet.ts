
import {MaelstromAbilityItem} from "../item/MaelstromAbilityItem"
import {systemBasePath, systemName} from "../settings"

/**
 * Higher order function that generates an item creation handler.
 *
 * @param {String} itemType The type of the Item (eg. 'ability', 'weapon', etc.)
 * @param {*} itemClass
 * @param {*} [callback=null]
 * @returns
 */
function onItemCreate(itemType, itemClass, callback = null) {
    return async function(event = null) {
        if (event)
            event.preventDefault();

        const newName = game.i18n.localize(`MAELSTROM.item.${itemType}.new${itemType.capitalize()}`);

        const itemData = {
            name: newName,
            type: itemType,
            data: new itemClass({}),
        };

        const newItem = await this.actor.createOwnedItem(itemData);
        if (callback)
            callback(newItem);

        return newItem;
    }
}

//Sort function for order
const sortFunction = (a, b) => a.data.order < b.data.order ? -1 : a.data.order > b.data.order ? 1 : 0;

// Stolen from https://stackoverflow.com/a/34064434/20043
function htmlDecode(input) {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

//Function to remove any HTML markup from eg. item descriptions
function removeHtmlTags(str) {
    // Replace any HTML tag ('<...>') by an empty string
    // and then un-escape any HTML escape codes (eg. &lt;)
    return htmlDecode(str.replace(/<.+?>/gi, ""));
}

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class MaelstromActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["boilerplate", "sheet", "actor"],
            width: 925,
            height: 1000,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /**
     * Get the correct HTML template path to use for rendering this particular sheet
     * @type {String}
     */
    get template() {
        // 1: Domesday
        // 2: Gothic
        // 3: Rome
        switch (game.settings.get(systemName, "characterSheet"))
        {
            case 1:
            case 2:
            case 3:
                return `${systemBasePath}/templates/actor/actorSheet.html`;
            default:
                throw new Error("Invalid setting for actorSheet template")
        }
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const sheetData = super.getData();
        // @ts-ignore
        sheetData.dtypes = ["String", "Number", "Boolean"];
        // @ts-ignore
        for (let attr of Object.values(sheetData.data.attributes)) {
            // @ts-ignore
            attr.isCheckbox = attr.dtype === "Boolean";
        }

        // Prepare items.
        if (this.actor.data.type == 'character') {
            this._prepareCharacterItems(sheetData);
        }

        return sheetData;
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param sheetData
     * @return {undefined}
     */
    _prepareCharacterItems(sheetData: ActorSheetData) {
        // @ts-ignore
        sheetData.data.items = sheetData.actor.items || {};

        // @ts-ignore
        const items = sheetData.data.items;

        Object.entries({
            abilities: MaelstromAbilityItem.type
        }).forEach(([val, type]) => {
            // @ts-ignore
            if (!sheetData.data.items[val])
                { // @ts-ignore
                    sheetData.data.items[val] = items.filter(i => i.type === type).sort(sortFunction)
                }
        });

        // @ts-ignore
        sheetData.data.items.abilities = sheetData.data.items.abilities.map(ability => {
            ability.data.notes = removeHtmlTags(ability.data.notes);
            return ability;
        });
    }

    /* -------------------------------------------- */

    /** @override */
/*    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Add Inventory Item
        html.find('.item-create').click(this._onItemCreate.bind(this));

        // Update Inventory Item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            item.sheet.render(true);
        });

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            this.actor.deleteOwnedItem(li.data("itemId"));
            li.slideUp(200, () => this.render(false));
        });

        // Rollable abilities.
        html.find('.rollable').click(this._onRoll.bind(this));

        // Drag events for macros.
        if (this.actor.owner) {
            let handler = ev => this._onDragItemStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }
*/
    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
/*    _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            data: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.data["type"];

        // Finally, create the item!
        return this.actor.createOwnedItem(itemData);
    }
*/
    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
/*    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        if (dataset.roll) {
            let roll = new Roll(dataset.roll, this.actor.data.data);
            let label = dataset.label ? `Rolling ${dataset.label}` : '';
            roll.roll().toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: label
            });
        }
    }
*/
}
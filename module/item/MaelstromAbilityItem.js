export class MaelstromAbilityItem extends Item {
    static get type() {
        return "ability";
    }
    prepareData() {
        if (!this.img || this.img === this.constructor.DEFAULT_ICON)
            // Override common default icon
            this.img = 'icons/svg/aura.svg';
        super.prepareData();
        let itemData = this.system;
        if (itemData.hasOwnProperty("data"))
            itemData = itemData.data;
        itemData.name = this.name || game.i18n.localize("MAELSTROM.item.ability.newAbility");
        itemData.notes = itemData.notes || "";
        itemData.rank = itemData.rank || "";
        itemData.benefit = itemData.benefit || "";
    }
}

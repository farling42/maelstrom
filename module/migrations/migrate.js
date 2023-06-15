import { MaelstromActorMigrator } from "./MaelstromActorMigrator.js";
export async function migrateWorld() {
    var _a, _b;
    if (!((_a = game.user) === null || _a === void 0 ? void 0 : _a.isGM))
        return;
    const currentMaelstromActorVersion = MaelstromActorMigrator.forVersion;
    let maelstromActors = (_b = game.actors) === null || _b === void 0 ? void 0 : _b.contents.filter(actor => 
    // @ts-ignore
    actor.data.type === 'character' && actor.data.data.version < currentMaelstromActorVersion);
    if (maelstromActors && maelstromActors.length > 0) {
        // @ts-ignore
        ui.notifications.info(`Applying Maelstrom system migrations. Please be patient and do not close your game or shut down your server.`, { permanent: true });
        async function migrateCollection(migrator, collection, name) {
            try {
                if (collection && collection.length > 0) {
                    const updatedData = await Promise.all(collection.map(async (obj) => await migrator.migrate(obj)));
                    for (let i = 0; i < collection.length; i++) {
                        if (updatedData[i] !== null) {
                            await collection[i].update(updatedData[i]);
                        }
                    }
                    console.log(`${name} migration succeeded!`);
                }
            }
            catch (e) {
                console.error(`Error in ${name} migrations`, e);
            }
        }
        migrateCollection(MaelstromActorMigrator, maelstromActors, "character");
        // @ts-ignore
        ui.notifications.info(`Maelstrom system migration completed!`, { permanent: true });
    }
}

import {JekyllMigrationProvider} from "./migrate/jekyllMigrationProvider.js";
import {WordpressMigrationProvider} from "./migrate/wordpressMigrationProvider.js";
import {GhostMigrationProvider} from "./migrate/ghostMigrationProvider.js";
import {MediumMigrationProvider} from "./migrate/mediumMigrationProvider.js";

export class Migrate {
    provider: any;

    constructor(provider: string) {
        switch (provider) {
            case "jekyll":
                this.provider = new JekyllMigrationProvider();
                break;
            case "wordpress":
                this.provider = new WordpressMigrationProvider();
                break;
            case "ghost":
                this.provider = new GhostMigrationProvider();
                break;
            case "medium":
                this.provider = new MediumMigrationProvider();
                break;
            default:
                throw new Error("Unknown migration provider: " + provider);
        }
    }

    async migrate(src: string, dest: string) {
        if(!src || !dest) {
            throw new Error("Source and destination must be specified");
        }
        await this.getProvider().migrate(src, dest);
    }

    getProvider() {
        return this.provider;
    }

}

import { DataService } from "../data/dataService.js";
import { Config } from "../config.js";
import { RenderProviderInterface } from "./renderProviderInterface.js";
import { Feed } from "feed";
import { StorageService } from "../storage/storageService.js";
import {ConsoleMessage} from "../log.js";

export class AtomRenderProvider implements RenderProviderInterface{
    log: any;
    constructor() {
        this.log = new ConsoleMessage();
    }

    async render(data: DataService, config: Config): Promise<boolean> {
        let result = true;

        let feedConfig: any = {};

        if(config.title) {
            feedConfig.title = config.title;
        }

        feedConfig.generator = "Writr";

        if(config.url) {
            feedConfig.id = config.url + "/atom.xml";
            feedConfig.link = config.url + "/atom.xml";
            feedConfig.favicon = config.url + "/favicon.ico";

            feedConfig.feedLinks = {
                atom: config.url + "/atom.xml"
            }
        }

        feedConfig.author = {};

        if(config.authorName) {
            feedConfig.author.name = config.authorName;
        }

        if(config.authorEmail) {
            feedConfig.author.email = config.authorEmail;
        }

        feedConfig.copyright = new Date().getFullYear().toString() + " All Rights Reserved";

        let atomFeed = new Feed(feedConfig);

        //add in the posts
        let posts = await data.getPostsByCount(config.indexCount);

        for(let post of posts) {

            let feedPost: any = {};
            feedPost.title = post.title;
            feedPost.id = config.url + "/" + post.url;
            feedPost.link = config.url + "/" + post.url;
            feedPost.description = await post.getDescription();
            feedPost.content = await post.getBody();
            feedPost.author = feedConfig.author;
            feedPost.date = post.date;
            feedPost.published = post.date;

            atomFeed.addItem(feedPost);
        }

        //write the feed atom.xml
        await new StorageService().set(config.output + "/atom.xml", atomFeed.atom1());

        return result;
    }
}

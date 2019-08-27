import { expect } from "chai";
import "mocha";

import { Config } from "../src/config";
import { DataService } from "../src/data/dataService";

describe("Data Service", async () => {
  let config: Config = new Config();
  let ds: DataService;

  before(async () => {
    config.data.type = "file";
    config.data.postPath = __dirname + "/blog";
    config.data.contentPath = __dirname + "/blog/content";
    config.data.templatePath = __dirname + "/blog/templates";
    ds = new DataService(config);
  });

  it("get a provider based on the config", () => {
    expect(ds.getProvider()).to.not.equal(undefined);
  });

  it("get posts", async () => {
    let posts = await ds.getPosts();

    expect(posts.length).to.equal(5);
  });

  it("get post", async () => {
    let post = await ds.getPost("article-simple");

    expect(post.title).to.equal("Article Simple");
  });

  it("get published post", async () => {
    let post = await ds.getPublishedPost("article-simple");

    expect(post.title).to.equal("Article Simple");
  });

  it("should not get a valid post as it is unpublished", async () => {
    let post = await ds.getPublishedPost("the-largest-whale");

    expect(post).to.equal(undefined);
  });

  it("get published posts", async () => {
    let posts = await ds.getPublishedPosts();

    expect(posts.length).to.equal(4);
  });

  it("get tags", async () => {
    let tags = await ds.getTags();

    expect(tags.length).to.equal(12);
  });

  it("get published tags", async () => {
    let tags = await ds.getPublishedTags();

    expect(tags.length).to.equal(9);
  });

  it("get tag that is unpublished", async () => {
    let tag = await ds.getTag("blast");

    expect(tag.isPublished()).to.equal(false);
  });
});

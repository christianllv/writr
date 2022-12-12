import { Config } from '../src/config';
import { Cache } from '../src/cache'
import { Post } from '../src/post';
import { Tag } from '../src/tag';

describe('Cache', () => {

    let config: Config = new Config();
    let cache: Cache;

    beforeAll(async () => {

        config.loadConfig("./blog_example/config.json");
        cache = new Cache(config);

    });

    it('caching a post', async () => {

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        let result = await cache.setPost('foo', post);

        expect(result).toBe(true);
    });

    it('caching a post and retrieving it', async () => {

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        await cache.setPost('foo', post);

        let result = await cache.getPost('foo');

        if(result) {
            expect(result.title).toBe('foo');
        } else {
            fail();
        }
    });

    it('no cached hit', async () => {

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        await cache.setPost('foo', post);

        let result = await cache.getPost('bar');

        expect(result).toBeUndefined();
    });

    it('caching a post and retrieving it with functions', async () => {

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        await cache.setPost('foo', post);

        let result = await cache.getPost('foo');

        if(result) {
            expect(result.title).toBe("foo");
        } else {
            fail();
        }
        
    });

    it('caching a post and retrieving it with correct values', async () => {

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        post.keywords = new Array<string>();
        post.keywords.push('cat');
        post.keywords.push('dog');

        await cache.setPost('foo', post);

        let result = await cache.getPost('foo');

        if(result) {
            expect(result.keywords.length).toBe(2);
        } else {
            fail();
        }

    });

    it('caching posts and retrieving it with correct values', async () => {

        let key = "multipost"
        let posts = Array<Post>();

        let fooPost = new Post();
        fooPost.title = 'foo';
        fooPost.matter.date = new Date();

        fooPost.keywords = new Array<string>();
        fooPost.keywords.push('cat');
        fooPost.keywords.push('dog');

        posts.push(fooPost);

        let coolPost = new Post();
        coolPost.title = 'cool';
        coolPost.matter.date = new Date();

        coolPost.keywords = new Array<string>();
        coolPost.keywords.push('meow');
        coolPost.keywords.push('woof');

        posts.push(coolPost);

        await cache.setPosts(key, posts);

        let result = await cache.getPosts(key);

        if(result) {
            expect(result.length).toBe(2);
        } else {
            fail();
        }

    });

    it('caching a tag and retrieving it', async () => {

        let tag = new Tag('foo');

        await cache.setTag('foo', tag);

        let result = await cache.getTag('foo');

        if(result) {
            expect(result.name).toBe('foo');
        } else {
            fail();
        }
    });

    it('no cached hit', async () => {

        let tag = new Tag('foo');

        await cache.setTag('foo', tag);

        let result = await cache.getTag('bar');

        expect(result).toBeUndefined();
    });

    it('caching a tag and retrieving it with functions', async () => {

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        let tag = new Tag('foo');
        tag.posts.push(post);

        await cache.setTag('foo', tag);

        let result = await cache.getTag('foo');

        if(result) {
            expect(result.name).toBe("foo");
        } else {
            fail();
        }
    });

    it('caching a tags and retrieving it with functions', async () => {

        let key = "multitags"
        let tags = new Array<Tag>();

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        let tag = new Tag('foo');
        tag.posts.push(post);

        let post2 = new Post();
        post2.title = 'foo2';
        post2.matter.date = new Date();

        let tag2 = new Tag('foo2');
        tag2.posts.push(post2);

        tags.push(tag);
        tags.push(tag2);

        await cache.setTags(key, tags);

        let result = await cache.getTags(key);

        if(result) {
            expect(result.length).toBe(2);
        } else {
            fail();
        }

    });

    it(
        'caching a tag with post and retrieving it with correct values',
        async () => {

            let post = new Post();
            post.title = 'foo';
            post.matter.date = new Date();

            let tag = new Tag('foo');
            tag.posts.push(post);

            await cache.setTag('foo', tag);

            let result = await cache.getTag('foo');
            if(result) {
                expect(result.posts[0].title).toBe("foo");
            } else {
                fail();
            }

        }
    );

    it('caching a tag and a post and then clearing', async () => {

        let post = new Post();
        post.title = 'foo';
        post.matter.date = new Date();

        let tag = new Tag('foo');
        tag.posts.push(post);

        await cache.setTag('foo', tag);
        await cache.setPost('fff', post);

        await cache.clear();

        let result = await cache.getTag('foo');

        expect(result).toBeUndefined();
    });

    it('format name correctly', () => {

        expect(cache.formatName('blAh ', "post")).toBe(`post-blah`);
    });

    it('format name correctly and type', () => {

        expect(cache.formatName('blAh ', "poSt ")).toBe(`post-blah`);
    });
});
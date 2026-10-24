import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { SITE } from '../consts';
import { getPublishedPosts, postUrl } from '../utils/posts';

const parser = new MarkdownIt();

export async function GET(context: APIContext) {
	const posts = await getPublishedPosts();

	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site!,
		xmlns: {
			atom: 'http://www.w3.org/2005/Atom',
		},
		customData: `<language>zh-TW</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: postUrl(post),
			categories: post.data.tags,
			content: sanitizeHtml(parser.render(post.body ?? ''), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
			}),
		})),
	});
}

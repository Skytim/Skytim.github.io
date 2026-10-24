import readingTime from 'reading-time';
import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogPost[]> {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function formatDate(date: Date, locale = 'zh-TW'): string {
	return date.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function getReadingTimeLabel(body: string): string {
	const { minutes } = readingTime(body, { wordsPerMinute: 300 });
	const rounded = Math.max(1, Math.ceil(minutes));
	return `約 ${rounded} 分鐘閱讀`;
}

export function postSlug(post: BlogPost): string {
	return post.id.replace(/\.(md|mdx)$/, '');
}

export function postUrl(post: BlogPost): string {
	return `/blog/${postSlug(post)}/`;
}

export function collectTags(posts: BlogPost[]): Map<string, number> {
	const tagCounts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) {
			tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
		}
	}
	return new Map([...tagCounts.entries()].sort(([a], [b]) => a.localeCompare(b, 'zh-TW')));
}

const TAG_SLUG_OVERRIDES: Record<string, string> = {
	'C#': 'csharp',
	'.NET': 'dotnet',
	'F#': 'fsharp',
	'C++': 'cpp',
};

export function tagSlug(tag: string): string {
	const override = TAG_SLUG_OVERRIDES[tag];
	if (override) return override;
	return tag
		.trim()
		.toLowerCase()
		.replace(/[\s/#?%]+/g, '-')
		.replace(/^[.-]+|-+$/g, '');
}

export function tagUrl(tag: string): string {
	return `/tags/${tagSlug(tag)}/`;
}

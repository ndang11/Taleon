export function calculateReadingTime(content: any): {
	words: number;
	minutes: number;
} {
	let totalText = "";

	const nodes = content?.content || [];

	if (Array.isArray(nodes)) {
		nodes.forEach((node: any) => {
			if (node.text) {
				totalText += ` ${node.text}`;
			} else if (node.content) {
				const sub = calculateReadingTime(node);
				totalText += ` ${sub.words} words`;
			}
		});
	}

	const words = totalText
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
	const wordsPerMinute = 225;
	const minutes = Math.ceil(words / wordsPerMinute) || 1;

	return { words, minutes };
}

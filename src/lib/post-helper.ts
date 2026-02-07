export function calculateReadingTime(content: any): {
	words: number;
	minutes: number;
} {
	// Handle string content (HTML or plain text)
	if (typeof content === "string") {
		// Strip HTML tags for word counting
		const textOnly = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
		const words = textOnly ? textOnly.split(/\s+/).filter((w) => w.length > 0).length : 0;
		const wordsPerMinute = 225;
		const minutes = Math.ceil(words / wordsPerMinute) || 1;
		return { words, minutes };
	}

	// Handle JSON content (Tiptap/ProseMirror format)
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

export interface PostBlock {
	type: "paragraph" | "heading" | "image" | "code" | "list";
	data: Record<string, unknown>;
}

export interface PostContent {
	version?: string;
	time?: number;
	blocks: PostBlock[];
}

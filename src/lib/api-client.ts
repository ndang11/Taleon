const API_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "https://taleon-sijl.onrender.com/api";

/* =====================
   TYPES
===================== */

export interface CreatePostRequest {
	title: string;
	content: string;
	category: string;
	status: "draft" | "published" | "unpublished";
	image?: File;
}

export interface UpdatePostRequest {
	title?: string;
	content?: string;
	category?: string;
	status?: "draft" | "published" | "unpublished";
	image?: File;
}

/* =====================
   CREATE POST
===================== */

export async function createPost(data: CreatePostRequest, token: string) {
	const formData = new FormData();

	formData.append("title", data.title);
	formData.append("content", data.content);
	formData.append("category", data.category);
	formData.append("status", data.status);

	if (data.image) {
		formData.append("image", data.image);
	}

	const res = await fetch(`${API_URL}/posts`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`, // 🔥 critical
		},
		body: formData,
	});

	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.message || "Failed to create post");
	}

	return res.json();
}

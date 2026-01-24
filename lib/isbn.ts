export async function lookupISBN(isbn: string) {
    const cleanISBN = isbn.replace(/-/g, '').trim();
    if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
        throw new Error("Invalid ISBN length. Must be 10 or 13 digits.");
    }

    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&jscmd=data&format=json`);
    const data = await response.json();
    const bookKey = `ISBN:${cleanISBN}`;

    if (!data[bookKey]) {
        throw new Error("Book not found in OpenLibrary database.");
    }

    const bookData = data[bookKey];

    return {
        title: bookData.title,
        authors: bookData.authors?.map((a: any) => a.name) || ["Unknown Author"],
        description: bookData.description || "No description available.",
        coverUrl: bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small || "/placeholder-book.png",
        publishedDate: bookData.publish_date || "Unknown",
    };
}

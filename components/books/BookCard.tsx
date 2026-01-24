import Image from "next/image";
import Link from "next/link";
import { Book } from "@/types/book";

interface BookCardProps {
    book: Book;
}

export default function BookCard({ book }: BookCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
            <div className="aspect-[2/3] w-full overflow-hidden bg-gray-100 relative">
                <Image
                    src={book.coverUrl && book.coverUrl.startsWith('http') ? book.coverUrl : "https://placehold.co/400x600?text=No+Cover"}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-white/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-gray-900 border border-gray-200 z-10 shadow-sm">
                    {book.condition}
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-bold leading-tight line-clamp-1 mb-1 text-gray-900" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                    {book.authors.join(", ")}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-primary">
                        {book.credits} Credits
                    </span>
                    <Link href={`/books/${book.id}`}>
                        <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-900 hover:bg-primary hover:text-white transition-colors">
                            View Details
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

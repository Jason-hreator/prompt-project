import Link from "next/link";

interface PromptCardProps {
  id: number;
  title: string;
  description: string;
  model: string;
  modelColor: string;
  likes: number;
  comments: number;
  author?: string;
}

export default function PromptCard({
  id,
  title,
  description,
  model,
  modelColor,
  likes,
  comments,
  author,
}: PromptCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${modelColor}`}>
            {model}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <button className="flex items-center hover:text-blue-600">
              <span className="mr-1">👍</span> {likes}
            </button>
            <span className="mx-3">💬 {comments}</span>
            {author && <span className="text-gray-400 text-xs">作者: {author}</span>}
          </div>
          <Link
            href={`/prompts/${id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            查看详情 →
          </Link>
        </div>
      </div>
    </div>
  );
} 
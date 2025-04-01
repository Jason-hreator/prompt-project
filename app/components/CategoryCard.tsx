import Link from "next/link";

interface CategoryCardProps {
  id: number;
  name: string;
  slug: string;
  icon: string;
  count: number;
}

export default function CategoryCard({
  id,
  name,
  slug,
  icon,
  count,
}: CategoryCardProps) {
  return (
    <Link 
      href={`/categories/${slug}`} 
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
    >
      <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-medium">{name}</h3>
      <p className="text-sm text-gray-500 mt-1">{count}个提示词</p>
    </Link>
  );
} 
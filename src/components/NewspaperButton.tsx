"use client";
import Image from "next/image";

interface NewspaperButtonProps {
  imageSrc: string;
  name: string;
  alt?: string;
  onClick?: () => void;
}

export default function NewspaperButton({ imageSrc, name, alt, onClick }: NewspaperButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full p-4 flex items-center gap-3 text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
    >
      <div className="relative flex-shrink-0 w-12 h-12 overflow-hidden rounded-md">
        <Image
          src={imageSrc}
          alt={alt || `${name} logo`}
          width={48}
          height={48}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-125 group-hover:saturate-200 group-hover:drop-shadow group-hover:filter"
        />
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {name}
      </span>
    </button>
  );
}

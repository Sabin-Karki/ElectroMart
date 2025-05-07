import { Link } from "wouter";

const CategoryCard = ({ category }) => {
  const { name, icon } = category;
  
  return (
    <Link href={`/products?category=${name}`} className="group">
      <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center transition hover:shadow-md">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <i className={`${icon} text-primary text-xl md:text-2xl`}></i>
        </div>
        <h3 className="font-medium text-gray-800 group-hover:text-primary transition">{name}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;

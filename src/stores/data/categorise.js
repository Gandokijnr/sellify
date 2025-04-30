/**
 * Hierarchical category structure for the marketplace.
 * This structure supports up to three levels of categorization:
 * - Main Category (e.g., "Electronics")
 * - Subcategory (e.g., "Mobile Phones")
 * - Sub-subcategory (e.g., "Android Phones")
 *
 * Format: {
 *   MainCategory: {
 *     Subcategory1: [SubSubCategory1, SubSubCategory2, ...],
 *     Subcategory2: [SubSubCategory1, SubSubCategory2, ...],
 *   }
 * }
 */

const categoryStructure = {
  Electronics: {
    "Mobile Phones": [
      "Android Phones",
      "iPhones",
      "Feature Phones",
      "Accessories",
    ],
    Computers: ["Laptops", "Desktops", "Tablets", "Accessories"],
    "TV & Audio": [
      "Televisions",
      "Home Theater",
      "Audio Systems",
      "Accessories",
    ],
    Cameras: [
      "Digital Cameras",
      "DSLR Cameras",
      "Video Cameras",
      "Accessories",
    ],
    "Home Appliances": [
      "Kitchen Appliances",
      "Washing Machines",
      "Air Conditioners",
      "Refrigerators",
    ],
  },
  Vehicles: {
    Cars: ["Sedan", "SUV", "Truck", "Van", "Convertible"],
    Motorcycles: ["Sport Bikes", "Cruisers", "Scooters", "Off-Road"],
    "Commercial Vehicles": ["Buses", "Trucks", "Tractors", "Trailers"],
    Watercraft: ["Boats", "Jet Skis", "Yachts"],
    "Vehicle Parts": ["Car Parts", "Motorcycle Parts", "Commercial Parts"],
  },
  "Real Estate": {
    "Houses & Apartments For Sale": [
      "Houses",
      "Apartments",
      "Land",
      "Commercial Property",
    ],
    "Houses & Apartments For Rent": [
      "Houses",
      "Apartments",
      "Short Lets",
      "Roommates",
    ],
    Land: [
      "Residential Land",
      "Commercial Land",
      "Industrial Land",
      "Agricultural Land",
    ],
    "Commercial Property": [
      "Office Space",
      "Shop Space",
      "Warehouses",
      "Event Centers",
    ],
  },
  Fashion: {
    Clothing: ["Men's Clothing", "Women's Clothing", "Children's Clothing"],
    Footwear: ["Men's Footwear", "Women's Footwear", "Children's Footwear"],
    Bags: ["Handbags", "Backpacks", "Travel Bags", "Wallets"],
    Jewelry: ["Necklaces", "Rings", "Earrings", "Bracelets"],
    Watches: [
      "Men's Watches",
      "Women's Watches",
      "Smart Watches",
      "Luxury Watches",
    ],
  },
  Jobs: {
    "Full-time": [
      "IT & Software",
      "Marketing",
      "Sales",
      "Administrative",
      "Engineering",
    ],
    "Part-time": ["Retail", "Hospitality", "Education", "Customer Service"],
    Contract: [
      "Project Management",
      "Consulting",
      "Construction",
      "Healthcare",
    ],
    Internships: ["Student Internships", "Graduate Internships"],
    "Remote Work": [
      "Remote IT",
      "Remote Writing",
      "Remote Administrative",
      "Remote Customer Support",
    ],
  },
  Services: {
    "Home Services": ["Cleaning", "Repairs", "Gardening", "Construction"],
    "Professional Services": [
      "Legal",
      "Accounting",
      "Consulting",
      "IT Support",
    ],
    "Health & Beauty": ["Salon", "Spa", "Fitness", "Healthcare"],
    Events: [
      "Wedding Planning",
      "Birthday Parties",
      "Corporate Events",
      "Catering",
    ],
    Education: ["Tutoring", "Training Courses", "Coaching", "Workshops"],
  },
  Furniture: {
    "Living Room": ["Sofas", "Tables", "TV Stands", "Bookshelves"],
    Bedroom: ["Beds", "Mattresses", "Wardrobes", "Nightstands"],
    "Kitchen & Dining": [
      "Dining Tables",
      "Chairs",
      "Kitchen Cabinets",
      "Bar Stools",
    ],
    "Office Furniture": [
      "Desks",
      "Office Chairs",
      "Filing Cabinets",
      "Bookshelves",
    ],
    "Outdoor Furniture": [
      "Patio Sets",
      "Garden Chairs",
      "Hammocks",
      "Outdoor Tables",
    ],
  },
  Agriculture: {
    Livestock: ["Cattle", "Poultry", "Fish Farming", "Other Animals"],
    Crops: ["Grains", "Vegetables", "Fruits", "Cash Crops"],
    "Farm Equipment": [
      "Tractors",
      "Ploughs",
      "Harvesters",
      "Irrigation Systems",
    ],
    "Farm Land": ["Agricultural Land", "Plantations", "Ranches"],
    "Agricultural Services": ["Consulting", "Training", "Farm Management"],
  },
};

export default categoryStructure;

/**
 * Function to convert nested category structure to a flat list of paths
 * This is useful for displaying in dropdowns or when you need a flat list
 * @returns {Array<string>} Array of category paths (e.g., ["Electronics > Mobile Phones > Android Phones"])
 */
export const getCategoryPaths = () => {
  const paths = [];

  Object.entries(categoryStructure).forEach(([mainCategory, subCategories]) => {
    // Add main category
    paths.push(mainCategory);

    Object.entries(subCategories).forEach(([subCategory, subSubCategories]) => {
      // Add main > sub
      paths.push(`${mainCategory} > ${subCategory}`);

      // Add main > sub > subsub
      subSubCategories.forEach((subSubCategory) => {
        paths.push(`${mainCategory} > ${subCategory} > ${subSubCategory}`);
      });
    });
  });

  return paths;
};

/**
 * Function to parse a category path into its components
 * @param {string} path - A category path string like "Electronics > Mobile Phones > Android Phones"
 * @returns {Object} Object with mainCategory, subCategory, and subSubCategory fields
 */
export const parseCategoryPath = (path) => {
  if (!path) return { mainCategory: "", subCategory: "", subSubCategory: "" };

  const parts = path.split(" > ");
  return {
    mainCategory: parts[0] || "",
    subCategory: parts[1] || "",
    subSubCategory: parts[2] || "",
  };
};

/**
 * Function to build a category path from components
 * @param {Object} components - Object with mainCategory, subCategory, and subSubCategory fields
 * @returns {string} A category path string
 */
export const buildCategoryPath = ({
  mainCategory,
  subCategory,
  subSubCategory,
}) => {
  let path = mainCategory || "";

  if (subCategory) {
    path += ` > ${subCategory}`;

    if (subSubCategory) {
      path += ` > ${subSubCategory}`;
    }
  }

  return path;
};

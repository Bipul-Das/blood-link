// Helper function to capitalize first letter of each word
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const sanitizeInput = (req, res, next) => {
  try {
    const sanitize = (obj) => {
      for (let key in obj) {
        // If the value is a String, we process it
        if (typeof obj[key] === "string") {
          // 1. Global Trim (Remove opening/closing spaces)
          obj[key] = obj[key].trim();

          // 2. Email Normalization (Always lowercase)
          if (key === "email") {
            obj[key] = obj[key].toLowerCase();
          }

          // 3. Name & Hospital Capitalization (Title Case)
          // Checks for keys: 'name', 'hospital', or any key containing 'Name' (e.g., patientName)
          if (
            key === "name" ||
            key === "hospital" ||
            key === "location" ||
            key === "city" ||
            key.toLowerCase().includes("name")
          ) {
            obj[key] = toTitleCase(obj[key]);
          }

          // 4. Code & ID Normalization (Uppercase)
          // Checks for bloodGroup, batchId, or any 'id' field
          if (
            key === "bloodGroup" ||
            key === "batchId" ||
            key === "id" ||
            key.toLowerCase().includes("id")
          ) {
            // Special exception: Don't uppercase MongoDB's default '_id'
            if (key !== "_id") {
              obj[key] = obj[key].toUpperCase();
            }
          }
        } 
        // Recursion: If the value is an object (and not null), dive deeper
        else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };

    // Apply sanitization to the request body
    if (req.body) {
      sanitize(req.body);
    }
    
    // Also sanitize query parameters (e.g., ?search=  jemma  )
    if (req.query) {
      sanitize(req.query);
    }

    next();
  } catch (error) {
    console.error("Sanitization Error:", error);
    next(); // If error, proceed anyway to avoid hanging request, but log it
  }
};

module.exports = sanitizeInput;
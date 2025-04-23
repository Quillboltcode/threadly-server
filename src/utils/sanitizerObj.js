// Utility function to sanitize any object, including nested objects and arrays
export const sanitizeObject = (obj, fieldsToInclude) => {
  if (!obj) return null;

  // If the input is an array, recursively sanitize each element
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, fieldsToInclude));
  }

  // If the input is an object, create a sanitized version
  if (typeof obj === "object") {
    if (obj._bsontype === "ObjectID" || obj.constructor.name === "ObjectId") {
      return obj.toString(); // Convert ObjectId to string
    }

    if (obj instanceof Date) {
      return obj.toISOString(); // Convert Date to ISO string
    }
    const sanitized = {};
    fieldsToInclude.forEach((field) => {
      if (obj[field] !== undefined) {
        // Recursively sanitize nested objects or arrays
        sanitized[field] =
          typeof obj[field] === "object" ? sanitizeObject(obj[field], getFieldsFor(field)) : obj[field];
      }
    });
    return sanitized;
  }

  // If the input is neither an object nor an array, return it as is
  return obj;
};

// Helper function to get fields to include for specific nested objects
const getFieldsFor = (field) => {
  switch (field) {
    case "author":
      return ["_id","username", "firstName", "email","lastName", "isVerified","avatar","followers","following"];
    case "comment":
      return ["content", "author", "image", "createdAt", "updatedAt"];
    case "followers":
      return ["_id"];
    case "following":
      return ["_id"]
    default:
      return [];
  }
};

// Specific function for sanitizing user objects
export const sanitizeUser = (user) => {
  const fieldsToInclude = [
    "_id",
    "email",
    "username",
    "firstName",
    "lastName",
    "isVerified",
    "bio",
    "followers",
    "following",
    "avatar",
    "provider",
  ];

  return sanitizeObject(user, fieldsToInclude);
};

// Specific function for sanitizing post objects
export const sanitizePost = (post) => {
  const fieldsToInclude = [
    "_id",
    "content",
    "tags",
    "author",
    "image",
    "comments",
    "commentCount",
    "likeCount",
    "createdAt",
    "updatedAt",
  ];

  return sanitizeObject(post, fieldsToInclude);
};

export const sanitizeComment = (comment) => {
  const fieldToInclude = [
    "content",
    "author",
    "image",
    "createdAt",
    "updatedAt"
  ];
  return sanitizeObject(comment, fieldToInclude);
};

const postData = [
  {
    _id: "67e4b33873e145ca0715e333",
    content: "Just finished a 10K run! 🏃‍♂️",
    tags: ["fitness", "running"],
    author: {
      _id: "67e4ac8b47024bd2b1c81a5a",
      username: "admin_user",
      firstName: "Admin",
      lastName: "User",
      isVerified: true,
    },
    image: [],
    comments: [],
    commentCount: 0,
    likeCount: 39,
    createdAt: "2025-03-27T02:08:56.805Z",
    updatedAt: "2025-03-27T02:08:56.805Z",
  },
];

const userData = [
  
    {
      "_id": "67e4ac8b47024bd2b1c81a58",
      "username": "john_doe",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
      "bio": "Love coding and coffee!",
      "isVerified": true,
      "role": "user",
      "followers": [],
      "following": [
        "67e4ac8b47024bd2b1c81a5c",
        "67e4ac8b47024bd2b1c81a5b"
      ],
      "Provider": "local",
      "isActive": true,
      "__v": 0,
      "createdAt": "2025-03-27T01:40:27.966Z",
      "updatedAt": "2025-04-09T07:50:45.816Z"
    }
  
]
// const sanitizedUser = sanitizeUser(userData);
// console.log(sanitizedUser);
// const sanitizedPosts = sanitizePost(postData);

// console.log(sanitizedPosts);
// // Output:
// [
//   {
//     _id: "67e4b33873e145ca0715e333",
//     content: "Just finished a 10K run! 🏃‍♂️",
//     tags: ["fitness", "running"],
//     author: {
//        _id: "67e4ac8b47024bd2b1c81a5a",
//       username: "admin_user",
//       firstName: "Admin",
//       lastName: "User",
//       isVerified: true
//     },
//     image: [],
//     comments: [],
//     commentCount: 0,
//     likeCount: 39,
//     createdAt: "2025-03-27T02:08:56.805Z",
//     updatedAt: "2025-03-27T02:08:56.805Z"
//   }
// ]
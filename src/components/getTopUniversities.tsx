// getTopUniversities.js

import { db } from "../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const getTopUniversities = async (limitCount = 10) => {
  try {
    const universitiesRef = collection(db, 'universitys');
    const q = query(universitiesRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    console.log("Top unis fetched successfully");
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        docId: doc.id,
        title: data.name,
        path: `/corsi?university=${doc.id}`,
        newTab: false,
      };
    });

  } catch (error) {
    console.error("Error fetching top universities:", error);
    return [];
  }
};

export { getTopUniversities };

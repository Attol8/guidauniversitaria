import { db } from "../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const getTopLocations = async (limitCount = 10) => {
  try {
    const locationsRef = collection(db, 'locations');
    const q = query(locationsRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    console.log("Top locations fetched successfully");

    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        docId: doc.id,
        title: data.name,
        path: `/corsi?location=${doc.id}`,
        newTab: false,
      };
    });

  } catch (error) {
    console.error("Error fetching top locations:", error);
    return [];
  }
};

export { getTopLocations };

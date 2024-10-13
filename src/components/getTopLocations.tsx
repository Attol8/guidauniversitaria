import { db } from "../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const getTopLocations = async (limitCount = 10) => {
  try {
    const locationsRef = collection(db, 'locations');
    const q = query(locationsRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      console.log(`Location ${index + 1}:`, data);
      return {
        id: index + 1,
        title: data.name,
        path: `/corsi/location/${doc.id}`,
        newTab: false,
      };
    });
  } catch (error) {
    console.error("Error fetching top locations:", error);
    return [];
  }
};

export { getTopLocations };

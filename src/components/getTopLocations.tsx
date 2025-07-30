import { db } from "../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface LocationData {
  id: number;
  docId: string;
  title: string;
  path: string;
  newTab: boolean;
}

const getTopLocations = async (limitCount: number = 10): Promise<LocationData[]> => {
  try {
    const locationsRef = collection(db, 'locations');
    const q = query(locationsRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn("No locations found in database");
      return [];
    }

    console.log(`Fetched ${snapshot.docs.length} locations successfully`);

    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      
      if (!data.name) {
        console.warn(`Location document ${doc.id} missing name field`);
      }
      
      return {
        id: index + 1,
        docId: doc.id,
        title: data.name || 'Unknown Location',
        path: `/corsi?location=${doc.id}`,
        newTab: false,
      };
    });

  } catch (error) {
    console.error("Error fetching top locations:", error);
    throw new Error(`Failed to fetch locations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export { getTopLocations };

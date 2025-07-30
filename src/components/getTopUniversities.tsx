// getTopUniversities.tsx

import { db } from "../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface UniversityData {
  id: number;
  docId: string;
  title: string;
  path: string;
  newTab: boolean;
}

const getTopUniversities = async (limitCount: number = 10): Promise<UniversityData[]> => {
  try {
    const universitiesRef = collection(db, 'universitys');
    const q = query(universitiesRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn("No universities found in database");
      return [];
    }

    console.log(`Fetched ${snapshot.docs.length} universities successfully`);
    
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      
      if (!data.name) {
        console.warn(`University document ${doc.id} missing name field`);
      }
      
      return {
        id: index + 1,
        docId: doc.id,
        title: data.name || 'Unknown University',
        path: `/corsi?university=${doc.id}`,
        newTab: false,
      };
    });

  } catch (error) {
    console.error("Error fetching top universities:", error);
    throw new Error(`Failed to fetch universities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export { getTopUniversities };

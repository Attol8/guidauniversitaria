import { db } from "../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface DisciplineData {
  id: number;
  docId: string;
  title: string;
  path: string;
  newTab: boolean;
}

const getTopDisciplines = async (limitCount: number = 10): Promise<DisciplineData[]> => {
  try {
    const disciplinesRef = collection(db, 'disciplines');
    const q = query(disciplinesRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn("No disciplines found in database");
      return [];
    }

    console.log(`Fetched ${snapshot.docs.length} disciplines successfully`);

    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      
      if (!data.name) {
        console.warn(`Discipline document ${doc.id} missing name field`);
      }
      
      return {
        id: index + 1,
        docId: doc.id,
        title: data.name || 'Unknown Discipline',
        path: `/corsi?discipline=${doc.id}`,
        newTab: false
      };
    });

  } catch (error) {
    console.error("Error fetching top disciplines:", error);
    // Re-throw the error so calling code can handle it appropriately
    throw new Error(`Failed to fetch disciplines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export { getTopDisciplines };
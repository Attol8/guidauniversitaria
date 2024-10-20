import { db } from "../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const getTopDisciplines = async (limitCount = 10) => {
  try {
    const disciplinesRef = collection(db, 'disciplines');
    const q = query(disciplinesRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    console.log("Top disciplines fetched successfully");

    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        docId: doc.id,
        title: data.name,
        path: `/corsi?discipline=${doc.id}`,
        newTab: false
      };
    });

  } catch (error) {
    console.error("Error fetching top disciplines:", error);
    return [];
  }
};

export { getTopDisciplines };
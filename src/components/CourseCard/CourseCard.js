import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

// A function to truncate text with ellipsis in the middle
function truncateMiddle(text, startChars, endChars, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  const start = text.slice(0, startChars);
  const end = text.slice(-endChars);
  return `${start}...${end}`;
}

const CourseCard = ({ course }) => {
  // Calculate the middle truncated text
  const courseTitle = truncateMiddle(course.nomeCorso, 30, 30, 90);

  return (
    <div className="course-card bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
      <div className="image-section relative">
        <img src={`https://picsum.photos/seed/${course.id}/458/200`} alt={course.nomeCorso} className="w-full object-cover" style={{ height: '200px' }} />
        <img src="https://via.placeholder.com/80?text=Logo" alt="Logo" className="logo absolute left-8 -bottom-6 h-120 w-120 rounded-lg shadow-xl" />
        <button className="favorite-btn absolute top-2 right-2 text-gray-600 hover:text-red-500">
          <FontAwesomeIcon icon={farHeart} size="lg" />
        </button>
      </div>
      <div className="info-section flex flex-col p-8 pt-12 space-y-4 flex-grow">
        <h3 className="course-title font-bold text-xl" title={course.nomeCorso}>{courseTitle}</h3>
        <p className="course-univeristy text-sm text-gray-700">{course.nomeStruttura || 'N/A'}</p>
        <p className="course-description text-sm text-gray-700 truncate">{course.sede?.comuneDescrizione || 'N/A'}</p>
        <div className="additional-info flex justify-between items-center">
          <span className="starting-year text-sm font-semibold">Starting Year: {course.anno?.descrizione || 'N/A'}</span>
          <span className="language text-sm font-semibold">Language: {course.lingua || 'N/A'}</span>
        </div>
      </div>
      <Link href={`/courses/${course.id}`} className="learn-more btn btn-primary btn-outline btn-sm mt-auto mb-4 mx-8">
        Learn more
      </Link>
    </div>
  );
};

export default CourseCard;
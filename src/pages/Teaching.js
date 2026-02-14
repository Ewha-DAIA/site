import { loadData } from '../utils/dataLoader.js';

export default async function Teaching() {
  const teaching = await loadData('teaching.json');
  if (!teaching) return '<p>Error loading teaching data.</p>';

  // Group by Semester
  const grouped = teaching.reduce((acc, course) => {
    const semester = course.semester || "Other";
    if (!acc[semester]) acc[semester] = [];
    acc[semester].push(course);
    return acc;
  }, {});

  return `
    <section class="page-content">
      <h1 class="page-title">Teaching</h1>
      <div class="teaching-container">
        ${Object.entries(grouped).map(([semester, courses]) => `
          <div class="semester-group">
            <h2 class="semester-title semester-spacing">${semester}</h2>
            <div class="course-list">
              ${courses.map(course => `
                <div class="course-item compact">
                  <div class="course-code">${course.code}</div>
                  <div class="course-info">
                    <p class="course-name">${course.name} (${course.name_eng})</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

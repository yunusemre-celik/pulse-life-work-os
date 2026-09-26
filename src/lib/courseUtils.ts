import { AcademicCourse, CourseSchedule, DayOfWeek } from '@/types';

export interface UnifiedCourse extends AcademicCourse {
  allSchedules: CourseSchedule[];
  courseIds: string[];
}

export interface DayClassSession {
  courseId: string;
  courseCode: string;
  courseName: string;
  instructor?: string;
  classroom?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime?: string;
  colorTag?: string;
}

const DAY_ORDER: Record<DayOfWeek, number> = {
  Pazartesi: 1,
  Salı: 2,
  Çarşamba: 3,
  Perşembe: 4,
  Cuma: 5,
  Cumartesi: 6,
  Pazar: 7,
};

/**
 * Normalizes and groups courses by their course code (e.g. "CS 4007").
 * Aggregates all schedule slots (e.g. Salı 09:00-10:50 and Çarşamba 09:00-09:50)
 * into a single unified course card, eliminating duplicate course entries.
 */
export function groupCoursesByCode(courses: AcademicCourse[]): UnifiedCourse[] {
  if (!Array.isArray(courses)) return [];

  const map = new Map<string, UnifiedCourse>();

  for (const course of courses) {
    const rawKey = course.code || course.name;
    if (!rawKey) continue;
    const normalizedKey = rawKey.trim().toUpperCase();

    // Extract schedule slots from the current course entry
    const slots: CourseSchedule[] = [];
    if (Array.isArray(course.schedules) && course.schedules.length > 0) {
      slots.push(...course.schedules);
    } else if (course.dayOfWeek && course.startTime) {
      slots.push({
        dayOfWeek: course.dayOfWeek,
        startTime: course.startTime,
        endTime: course.endTime,
        classroom: course.classroom,
      });
    }

    if (map.has(normalizedKey)) {
      const existing = map.get(normalizedKey)!;
      existing.courseIds.push(course.id);

      // Merge new schedule slots avoiding exact duplicates
      for (const slot of slots) {
        const isDuplicate = existing.allSchedules.some(
          (s) => s.dayOfWeek === slot.dayOfWeek && s.startTime === slot.startTime
        );
        if (!isDuplicate) {
          existing.allSchedules.push(slot);
        }
      }

      // Preserve metadata if existing was missing it
      if (!existing.instructor && course.instructor) existing.instructor = course.instructor;
      if (!existing.classroom && course.classroom) existing.classroom = course.classroom;
      if (!existing.letterGradeGoal && course.letterGradeGoal) existing.letterGradeGoal = course.letterGradeGoal;
      if (course.ects && (!existing.ects || existing.ects === 0)) existing.ects = course.ects;
      if (course.credits && (!existing.credits || existing.credits === 0)) existing.credits = course.credits;
    } else {
      map.set(normalizedKey, {
        ...course,
        courseIds: [course.id],
        allSchedules: [...slots],
      });
    }
  }

  // Sort each course's schedules chronologically by day & time
  const result = Array.from(map.values()).map((course) => {
    course.allSchedules.sort((a, b) => {
      const dayDiff = (DAY_ORDER[a.dayOfWeek] || 99) - (DAY_ORDER[b.dayOfWeek] || 99);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });
    return course;
  });

  // Sort courses by code (e.g. CS 3000, CS 3001, CS 3003, CS 4001, CS 4007, CS 4011, etc.)
  result.sort((a, b) => (a.code || '').localeCompare(b.code || ''));

  return result;
}

/**
 * Generates a weekly timetable grid organized by weekday (Pazartesi - Cuma),
 * with each day containing its lectures ordered by start time.
 */
export function getWeeklyScheduleGrid(courses: AcademicCourse[]): {
  days: { day: DayOfWeek; sessions: DayClassSession[] }[];
  unscheduledCourses: UnifiedCourse[];
} {
  const unified = groupCoursesByCode(courses);
  const weekDays: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  const daysMap: Record<DayOfWeek, DayClassSession[]> = {
    Pazartesi: [],
    Salı: [],
    Çarşamba: [],
    Perşembe: [],
    Cuma: [],
    Cumartesi: [],
    Pazar: [],
  };

  const unscheduledCourses: UnifiedCourse[] = [];

  for (const course of unified) {
    if (course.allSchedules.length === 0) {
      unscheduledCourses.push(course);
    } else {
      for (const slot of course.allSchedules) {
        if (daysMap[slot.dayOfWeek]) {
          daysMap[slot.dayOfWeek].push({
            courseId: course.id,
            courseCode: course.code,
            courseName: course.name,
            instructor: course.instructor,
            classroom: slot.classroom || course.classroom,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            colorTag: course.colorTag,
          });
        }
      }
    }
  }

  // Sort each day's sessions by start time
  const days = weekDays.map((day) => ({
    day,
    sessions: daysMap[day].sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return { days, unscheduledCourses };
}

# LACE Hub: UX & Navigation Recommendations
*Designing a seamless, time-efficient learning experience for busy Legal Aid Attorneys.*

Busy legal professionals often consume training in short, interrupted bursts (e.g., waiting for hearings, on transit, or in court hallway corners). This document serves as a design backlog and technical guide to optimize both the **LACE Discovery Hub** and the individual **Course Templates** for mobile, off-line, and high-speed usage.

---

## 🧭 Discovery Hub (`lms-discovery`) Checklist

Below are high-value features to implement in your Next.js/React discovery portal to make it extremely easy for attorneys to find and resume content.

### [ ] 1. Filter Catalog by "Time Budget"
Attorneys should be able to select courses that fit their exact free-time windows.
- **UI Elements**: Add chips at the top of the course catalog:
  - `☕ Quick Bites (< 15 mins)`
  - `⏱️ Standard (15–45 mins)`
  - `📚 Deep Dives (> 45 mins)`
- **Next.js Implementation**: Add a `durationMinutes` field to your course catalog JSON data and filter cards dynamically using a simple React state filter.

### [ ] 2. "Resume Learning" Dashboard CTA
Bypass landing pages entirely and return attorneys to where they left off in one click.
- **UI Elements**: A hero banner at the top of the hub showing the last active course and topic title.
- **Why it matters**: Cuts out 4 clicks on a slow mobile connection.

### [ ] 3. Practice Area Badges
Keep content relevant by categorizing courses by legal specialty.
- **UI Elements**: Color-coded badges and sidebar filters.
- **Categories**: `Housing`, `Family Law`, `Public Benefits`, `Consumer Protection`, `Immigration`.

### [ ] 4. "New Precedent" & "Urgent Update" Flags
Alert attorneys immediately when a course has been updated with a critical legal change.
- **UI Elements**: High-contrast outline borders or pulsing badges (e.g., `⚠️ Eviction Law Update`).
- **Why it matters**: Attorneys must know if the training matches current filing guidelines.

---

## ⚡ Technical Integration: Sharing Progress Data

Because both the **LACE Discovery Hub** and your **Brightspace Course HTML pages** will be hosted under the same domain root (e.g., `https://mcreed-mlri.github.io/`), they share the same browser `localStorage` sandbox. This means your React Discovery Hub can read student progress in real-time!

### How to read progress in React (`lms-discovery`):

You can read the local storage keys created by `course-nav.js` directly in your React code to display progress fractions or the "Resume" button.

```javascript
// Example helper to fetch course progress in your React components
export function getCourseProgress(courseId) {
  if (typeof window === 'undefined') return null;
  
  try {
    const storageKey = `lace_progress_${courseId}`;
    const rawData = localStorage.getItem(storageKey);
    if (!rawData) return null;
    
    const progress = JSON.parse(rawData);
    // Returns: { userName: "Student", completed: ["welcome", "topic-1"], lastVisited: "topic-1" }
    return progress;
  } catch (error) {
    console.error("Failed to read progress from LocalStorage", error);
    return null;
  }
}
```

### Rendering a "Resume" button on the Catalog:

```javascript
import React, { useEffect, useState } from 'react';

function CourseCard({ course }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Read from shared localStorage
    const data = getCourseProgress(course.id);
    setProgress(data);
  }, [course.id]);

  // Find where to link the resume button
  const getResumeUrl = () => {
    if (!progress || !progress.lastVisited) {
      return course.homeUrl; // Default to Course Home if not started
    }
    
    // Find the next incomplete topic URL in your catalog config
    const nextTopic = course.topics.find(t => !progress.completed.includes(t.slug));
    return nextTopic ? nextTopic.url : course.homeUrl;
  };

  const completedCount = progress ? progress.completed.length : 0;
  const progressPct = course.totalTopics ? Math.round((completedCount / course.totalTopics) * 100) : 0;

  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      {progress && (
        <div className="progress-bar-wrap">
          <span>{progressPct}% Complete</span>
          <div className="bar"><div style={{ width: `${progressPct}%` }}></div></div>
        </div>
      )}
      <a href={getResumeUrl()} className="btn-primary">
        {progress ? "Resume Course" : "Start Course"}
      </a>
    </div>
  );
}
```

---

## 📖 Course-Level Optimization checklist

Apply these visual editorial tweaks directly inside your topic templates to keep reading fast and scannable:

### [ ] 1. The "TL;DR" Box
Place a 3-bullet summary box at the very top of each content page inside a `.callout` box.
- **Purpose**: Gives attorneys the immediate answers if they are looking for a filing deadline or a specific form reference while on the go.

### [ ] 2. "Takeaway Checklist" Tables
Format summaries using checklists or structured tables instead of long dense paragraphs.

### [ ] 3. Offline Cheat Sheets (Downloadable PDF Links)
At the bottom of each module summary, place a clear PDF download link pointing to a single-sheet reference file.
- **Example**: `[Download eviction procedure flowchart PDF (Offline Friendly)]`

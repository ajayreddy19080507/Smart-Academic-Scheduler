# Timetable Algorithm: Sample Code & CSP Formulation

Below are the core segments of the Timetable Generator, highlighting the Constraint Satisfaction Problem (CSP) variables, domains, and the heuristic backtracking algorithm.

## 1. Domain Setup & Event Expansion
The algorithm expands raw subjects into discrete variables (`Event` objects). 
- **Domain for Slots**: 42 fixed periods per week.
- **Domain for Rooms**: Filtered by Room Type (`THEORY` or `LAB`).
- **Domain for Faculty**: Subsets based on subject qualifications.

```typescript
// 1. Expand Events (Variables)
const events: Event[] = [];
for (const section of sections) {
    for (const subject of section.subjects) {
        if (subject.isLab) {
            // Lab: Single large block variable
            events.push({
                id: `${section.id}-${subject.id}-LAB`,
                sectionId: section.id,
                subjectId: subject.id,
                isLab: true,
                duration: subject.duration || 3,
                roomId: null, facultyId: null
            });
        } else {
            // Theory: Multiple single-period variables
            for (let i = 0; i < subject.sessionsPerWeek; i++) {
                events.push({
                    id: `${section.id}-${subject.id}-${i}`,
                    sectionId: section.id,
                    subjectId: subject.id,
                    isLab: false,
                    duration: 1,
                    roomId: null, facultyId: null
                });
            }
        }
    }
}

// 2. Heuristic Pre-sorting to shrink the search space
events.sort((a, b) => {
    // Prioritize groups that have a Lab component (we must place 3-hour blocks earliest)
    const aHasLab = groupHasLab.get(groupA) ? 1 : 0;
    const bHasLab = groupHasLab.get(groupB) ? 1 : 0;
    if (aHasLab !== bHasLab) return bHasLab - aHasLab;
    // ... [Groups identical subjects together to fulfill the `same-teacher` constraint]
});
```

## 2. Core Backtracking Algorithm (`solve`)
This recursive function searches the domain space, attempting assignments, moving forward on success, and backtracking on failure or constraint violation.

```typescript
async function solve(events, index, currentSchedule, allSlots, labRooms, theoryRooms, limit, facultyMap, ... ) {
    // Base Case: All events successfully scheduled
    if (index >= events.length) return currentSchedule;

    limit.count++;
    const isTimeout = Date.now() - limit.startTime > 10000;
    const event = events[index];

    // Identify candidate domains
    const potentialFaculty = Array.from(facultyMap.values()).filter(f => f.subjectIds.has(event.subjectId));
    const candidateRooms = event.isLab ? labRooms : theoryRooms;

    // Shuffle slots for varied results, or sort sequentially if struggling
    let sortedSlots = [...allSlots];
    if (limit.count > 100000) { /* sequential greedy packing */ } 
    else { /* Math.random() shuffling */ }

    // CSP Iteration over Domains
    for (const slot of sortedSlots) {
        
        // Block invalid lab slots (e.g. crossing end-of-day boundary)
        if (event.duration > 1 && slot.period + event.duration - 1 > 7) continue;

        let assignedRoomId = null;
        if (candidateRooms.length > 0) {
            for (const room of candidateRooms) {
                // Room Constraint Check
                if (isRoomFree(room.id, slot, event.duration, currentSchedule, limit, isTimeout)) {
                    assignedRoomId = room.id;
                    break; 
                }
            }
            if (!assignedRoomId && limit.count < 100000 && !isTimeout) continue; 
        }

        // Try assigning Faculty
        for (const faculty of potentialFaculty) {
            // Complex Constraint Check
            if (isValid(event, slot, faculty.id, currentSchedule, facultyMap, limit, subjectMap, isTimeout)) {
                
                // Construct speculative branch
                const newBookings: Booking[] = [];
                for (let i = 0; i < event.duration; i++) {
                    newBookings.push({
                        sectionId: event.sectionId, subjectId: event.subjectId,
                        facultyId: faculty.id, roomId: assignedRoomId,
                        slot: { day: slot.day, period: slot.period + i }
                    });
                }

                // Recursion Step
                const nextSchedule = { bookings: [...currentSchedule.bookings, ...newBookings] };
                const result = await solve(events, index + 1, nextSchedule, /* ... */);
                
                // Return valid tree, else allow loop to continue (Backtrack context)
                if (result) return result;
            }
        }
    }

    // Gridlock Breaker / Timeout Handler
    if (limit.count > 100000 || isTimeout) {
        // [Force assignment ignoring secondary constraints to prevent server hang]
        return await solve(events, index + 1, nextSchedule, /* ... */);
    }

    // Failure: Trigger Backtrack
    return null;
}
```

## 3. Constraint Validation (`isValid`)
Evaluates the validity of an assignment against Hard and Soft constraints.

```typescript
function isValid(event, startSlot, facultyId, schedule, facultyMap, limit, subjectMap, isTimeout): boolean {
    const startPeriod = startSlot.period;

    for (let i = 0; i < event.duration; i++) {
        // HARD CONSTRAINT: Physical Double Booking Check (Cannot be in two places at once)
        const conflict = schedule.bookings.some(b =>
            b.slot.day === startSlot.day &&
            b.slot.period === startPeriod + i &&
            (b.sectionId === event.sectionId || b.facultyId === facultyId)
        );
        if (conflict) return false;
    }

    // HARD CONSTRAINT: 1 Theory Session of same subject per day
    if (event.duration === 1) {
        const sameSubjectOnDay = schedule.bookings.some(b =>
            b.sectionId === event.sectionId &&
            b.subjectId === event.subjectId &&
            b.slot.day === startSlot.day
        );
        if (sameSubjectOnDay) return false;
    }

    // HARD CONSTRAINT: Same Teacher for connected Theory & Lab courses
    let previouslyAssignedFaculty = /* ... logic to find if course already has a teacher assigned ... */
    if (previouslyAssignedFaculty && previouslyAssignedFaculty !== facultyId) {
        return false;
    }

    // SOFT CONSTRAINTS: Faculty Load (Relaxed under pressure)
    if (facultyId) {
        // Daily Limit Check
        const facultyDaily = schedule.bookings.filter(b => b.facultyId === facultyId && b.slot.day === startSlot.day).length;
        const dailyCap = limit.count > 50000 ? 6 : 4; // Progressively relax daily limit
        if (facultyDaily + event.duration > dailyCap) return false;

        // Weekly Max Load Check
        const facultyWeekly = schedule.bookings.filter(b => b.facultyId === facultyId).length;
        const fData = facultyMap.get(facultyId);
        
        if (fData && limit.count <= 100000) {
           if (facultyWeekly + event.duration > fData.maxLoad) return false;
        }
    }

    return true; // Node is valid -> safe to traverse
}
```

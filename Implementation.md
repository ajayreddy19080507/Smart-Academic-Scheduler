# Timetable Generator Implementation Guide

## Overview
The Timetable Generator is a robust backend service designed to automatically schedule university classes, ensuring that students, faculty, and rooms are not double-booked, while respecting various academic constraints. It utilizes a Constraint Satisfaction Problem (CSP) formulation solved via a custom Heuristic Backtracking Algorithm.

## Core Implementation Steps

### 1. Data Aggregation & Preparation
The algorithm begins by querying the database via Prisma ORM to gather all foundational entities:
- **Sections & Subjects**: What needs to be taught.
- **Faculty**: Who is qualified to teach what, along with their maximum weekly workload limits.
- **Rooms**: Physical spaces categorized strictly into `THEORY` and `LAB` types. (If no rooms are present, a fallback seed of default rooms is generated to prevent failure).

### 2. Event Expansion (Variables Definition)
The raw subjects attached to sections are expanded into discrete schedulable units called **Events**:
- **Theory Subjects**: Expanded into multiple single-period events based on `sessionsPerWeek`.
- **Lab Subjects**: Kept as a single contiguous event with a larger duration (e.g., 3 continuous periods).

### 3. Heuristic Pre-Sorting (Optimization)
To drastically reduce the backtracking search space, the expanded events are sorted before the solver runs:
1. **Lab Prioritization**: Event groups containing labs are pushed to the front. Placing large contiguous blocks (3 periods) earlier is much easier than trying to fit them into a fragmented schedule later.
2. **Subject Grouping**: Events belonging to the same base subject code for a particular section are grouped adjacently. This ensures that the constraint requiring the same faculty for both Theory and Lab components is resolved efficiently.

### 4. Backtracking Solver with CSP
The core engine is a recursive backtracking function (`solve`) that attempts to place each `Event` into a specific `Slot` (Day + Period), assigning a valid `Faculty` and `Room`.

#### The Search Loop:
For the current event in the recursion tree:
1. **Slot Selection**: The 42 weekly slots are shuffled randomly to avoid deterministic deep-looping and generate varied timetables.
2. **Room Assignment**: It searches for the first available room of the required type (`THEORY` or `LAB`) that is free for the entire duration of the event.
3. **Faculty Assignment**: It filters faculty who are qualified for the subject and iterates through them, checking against strict CSP constraints.
4. **Recursion**: If a valid (Slot, Room, Faculty) combination is found, the booking is added to the current schedule, and the algorithm recurses to the next event.
5. **Backtracking**: If no combination works, the algorithm returns `null`, unwinds to the previous event, and tries the next candidate slot/faculty.

### 5. Constraint Checking (`isValid` & `isRoomFree`)
The algorithm heavily relies on constraint validations to ensure a conflict-free schedule:

**Hard Constraints (Must be met):**
- **No Double Booking**: Faculty, Sections, and Rooms cannot be in two places at once.
- **Type Strictness**: Labs must go to Lab rooms; Theory must go to Theory rooms.
- **Subject Spread**: A section cannot have the same theory subject scheduled more than once on the exact same day.
- **Identical Faculty**: If a section has both a Theory and Lab component for a subject, the exact same faculty member must be assigned to both.

**Soft Constraints & Workload Constraints:**
- **Daily Caps**: Faculty are limited to teaching a maximum of 4 periods a day.
- **Weekly Caps**: Faculty assignments cannot exceed their predefined `maxLoad`.

### 6. Desperation / Gridlock Breaking Mode
Real-world academic data can sometimes be mathematically impossible or too dense to solve within a reasonable timeframe. The implementation includes progressive relaxation heuristics to guarantee a return value rather than hanging the server:
- **Iterative Relaxation**: If recursive calls exceed `50,000`, the daily faculty cap is relaxed from 4 to 6 periods.
- **Greedy Packing**: After `100,000` iterations, slot randomization is disabled, forcing the algorithm to pack events sequentially to find any valid gap. Room constraints may also be dropped, resulting in `null` rooms.
- **Emergency Override**: If the system detects an impending timeout (> 10 seconds), it bypasses faculty workload calculations and forces the event into the first slot where the section itself is free, guaranteeing completion of the algorithm at the cost of perfect constraint satisfaction.

### 7. Finalization
Upon successfully returning a valid schedule tree, old timetable data in the database is purged, and the new array of bookings is batched and saved to the database via `prisma.timetable.createMany()`. Output is logged, and the generation pipeline concludes.

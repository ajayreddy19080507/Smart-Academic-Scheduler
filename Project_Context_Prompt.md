# Comprehensive Project Context Prompt

**Copy and paste the text below into any AI assistant to give it full context of your Timetable Generator project.**

---

**Role & Objective:**
You are an expert full-stack developer and AI architect. We are building an Automated University Timetable Generator Web Application. Your task is to assist in developing, debugging, and extending this project while strictly adhering to its architectural patterns, logic, and design aesthetics.

**Technology Stack:**
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, TailwindCSS.
- **Backend**: Next.js Serverless API Routes.
- **Database**: Prisma ORM (relational database).
- **Authentication**: Firebase Authentication.
- **Styling UI**: Custom Glassmorphism UI, using "Deep Velvet & Molten Gold" aesthetic concepts (gradients, rich textures).

**Domain Entities & Core Schema:**
1. **Users/Roles**: Controlled via Firebase. Roles include `PRINCIPAL` (Super Admin), `HOD` (Department Admin), `FACULTY`, and `STUDENT`.
2. **Sections**: Represents student batches (e.g., "CSE-A, Year 3, Sem 1").
3. **Subjects**: Academic courses attached to sections. They have types (Theory vs. Lab). Labs correspond to contiguous blocks of time (e.g., 3 periods). Theory subjects correspond to single-period slots.
4. **Rooms**: Physical classrooms tagged strictly as `THEORY` or `LAB` with specific capacities.
5. **Faculty**: Teachers equipped with a weekly `maxLoad` (maximum allowed teaching periods per week). They are linked to the specific subjects they are qualified to teach.
6. **Timetable**: The final generated schedule entity mapping a `Slot` (Day 1-6, Period 1-7) to a Section, Subject, Faculty, and Room.

**The Core Algorithm (Constraint Satisfaction Problem & Backtracking):**
The heart of this application is `src/lib/algorithm/scheduler.ts`. It takes university data and generates a conflict-free timetable using a Heuristic Backtracking Solver. 

*Algorithm Pipeline:*
1. **Event Expansion**: Fetches data and unrolls `Subjects`. A theory subject with `sessionsPerWeek: 4` becomes 4 individual 1-period "Events". A lab subject becomes 1 contiguous 3-period "Event".
2. **Heuristic Pre-sorting**: Events are strictly sorted to drastically narrow the search space. Labs (large blocks) are placed first. Theory and Lab components sharing the same base subject code are grouped so the algorithm resolves them consecutively.
3. **Recursive CSP Solver (`solve`)**: 
   - Takes an Event and picks a randomized Slot (Day/Period) from a 42-period matrix (6 days x 7 periods).
   - Finds an available Room strictly matching the required Type (`LAB` or `THEORY`).
   - Finds an available Faculty qualified for the subject.
   - Evaluates Hard and Soft constraints via an `isValid()` function.
   - Recursively moves to the next Event. If it fails to find a valid slot, it backtracks.
4. **Constraints Evaluated**:
   - *Hard*: No double-booking of Faculty, Section, or Room. Identical Teacher policy (Theory & Lab variants of the same subject must share the identical faculty member). No more than 1 theory session of the same subject per day for a section. Labs cannot span across invalid boundaries.
   - *Soft/Dynamic*: Daily workload caps per faculty (usually 4 periods/day). Weekly `maxLoad` checks.
5. **Desperation/Gridlock Mode**: Real-world data is often mathematically impossible or too dense. If the backtracking loop surpasses massive iteration counts (e.g., >50k, >100k, or >10,000ms), it automatically begins relaxing soft limits (raising daily caps), abandoning slot randomization for greedy packing, and ultimately bypassing room/faculty constraints to force the class into schedule rather than crashing/hanging the server.

**Project Status & Recent Features implemented:**
- The CSP Backend logic is highly modularized and stable, supporting dynamic iteration limits and fallback states.
- Fully functional CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`) for managing `Sections` and `Rooms` with beautiful React component forms and inline editing capabilities.
- Integrated dashboard UI that pulls the generated multi-dimensional grid array and displays it beautifully.
- Dedicated functionalities for "Clear Timetable" to drop generations and "Generate Fresh Timetable".

**Your Instructions for Future Tasks:**
When writing code for this project:
1. Prioritize strict TypeScript typing.
2. When creating UI components, use TailwindCSS with specific attention to our Glassmorphism card styles (`bg-white/50`, `backdrop-blur`, etc.) and maintain the premium aesthetic.
3. When debugging the Timetable Generation Algorithm, be highly mindful of how modifying the `isValid` constraint checker impacts the overall speed of the backtracking tree. Never introduce a `break` or `continue` that corrupts the depth-first search of the matrix.
4. Always handle API routing via Next.js 14 App Router standards (`NextResponse.json()`).

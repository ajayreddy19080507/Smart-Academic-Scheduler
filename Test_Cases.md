# Timetable System: Test Cases

This document outlines scenarios engineered to evaluate the Constraint Satisfaction Problem (CSP) formulation, Backtracking mechanics, and system fail-safes. 

## 1. Hard Constraints Testing

| Test ID | Category | Scenario Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-H01** | Section Overlap | Schedule a section with 8 theory subjects, exceeding 7 daily periods. | The solver must place overflown subjects on different days. No section should have two subjects scheduled in the exact same day/period. |
| **TC-H02** | Faculty Overlap | Two different sections require the same Faculty for different subjects at the same time. | The backtracking algorithm guarantees the Faculty is placed in non-overlapping slots. The conflicting event is reassigned. |
| **TC-H03** | Room Overlap | Provide only 1 valid `THEORY` room, but 2 generic theory subjects across 2 sections are requested. | The subjects must be serialized. They cannot occupy the same `THEORY` room during the same period. |
| **TC-H04** | Room Type Strictness | A subject designated as `isLab: true` is fed to the solver. | The assignment must place the event mapping strictly to a room whose type is `LAB`. It cannot be assigned to `THEORY`. |
| **TC-H05** | Distributed Spread | A subject has `sessionsPerWeek: 3`. | The solver must schedule the 3 sessions on 3 *distinct* days for the same section. (A single subject cannot have 2 theory blocks on the same day). |
| **TC-H06** | Contiguous Lab Blocks | A subject designated as `isLab: true` with a `duration: 3`. | The solver must allocate 3 *continuous* slot periods (e.g., periods 1, 2, 3) on the same day in the same lab room. |
| **TC-H07** | Lab Boundary Safety | A lab with `duration: 3` attempts to schedule starting at period 6. | Backtracking identifies an out-of-bounds error (intersects period 8, max is 7). The slot is rejected. |
| **TC-H08** | Identical Teacher Policy | Section A has a "Physics Theory" and "Physics Lab". | Both the Theory instances and the contiguous Lab instance must be explicitly paired to the exact same `facultyId`. |

---

## 2. Soft Constraints & Workload Testing

| Test ID | Category | Scenario Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-S01** | Max Load Rejection | Faculty A has `maxLoad: 10`. Algorithm attempts to assign 12 periods. | The `isValid` check flags the constraint. The backtrack recurses aggressively finding another qualified faculty member. |
| **TC-S02** | Daily Fatigue | Faculty A is assigned subjects. Try to schedule them for 5 periods on a single day. | The `dailyCap` limit (set to 4) restricts this. The 5th assigned period is automatically pushed to the next day. |
| **TC-S03** | Empty Faculty Pool | A subject has no qualified faculty mappings in the database. | The system cascades through potential assignments, ultimately using the "unassigned fallback" (`facultyId = null`) representing a "TBA" professor. |

---

## 3. Desperation Heuristics & Fail-Safes Testing

| Test ID | Category | Scenario Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-F01** | Empty Room DB | The system database is completely wiped of all room data, then a generation is triggered. | The seeding script executes safely, populating default `LH-101` and `CP LAB-1` standard rooms before generation starts. |
| **TC-F02** | Moderate Stress Relaxation | The user creates a dense curriculum causing iterations to pass `50,000`. | The algorithm safely relaxes the Soft Daily Limit of the faculty members from 4 periods to 6 periods to allow finding a valid matrix. |
| **TC-F03** | High Stress Gridlock Breaker | The combination of Faculty limits + Rooms is mathematically impossible for the required subjects. Iterations cross `100,000`. | The solver suspends random slot shuffling, engaging greedy sequential packing. It ignores `maxLoad` and drops the `Room` requirement to `null` to force resolution. |
| **TC-F04** | Hard Timeout Overflow | The grid logic takes longer than 10,000ms calculating branches due to extremely massive datasets. | The `isTimeout` boolean engages. The algorithm abandons constraint checks and sequentially pushes classes into the first un-booked slot for the section, returning success to the frontend and preventing Node.js hangs. |

---

## 4. Integration Verification Testing 

| Test ID | Category | Scenario Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **TC-I01** | DB Purge Before Gen | Trigger the `POST /api/timetable/live` endpoint. | All entries belonging to `prisma.timetable.deleteMany({})` execute ensuring the old timetable does not corrupt the new one. |
| **TC-I02** | Result Marshalling | Algorithm returns an aggregated `Schedule` object. | `saveSchedule` executes; writes out debug JSON to filesystem, and correctly maps raw nested slot objects to `startTime`, `endTime`, `day`, and `slot` variables inside the SQL schema. |
| **TC-I03** | Faculty View Filter | Retrieve a timetable filtered by `facultyId`. | Endpoints correctly respond showing a conflict-free grid representing purely the allocated slots for that faculty without blanks or overlaps. |

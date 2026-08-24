// Starter document templates for /forms. Plain operational documents (Mode
// B territory) — no bylaw citation requirement, these are just solid
// starting points an AD fills in and sends. Coach Eli can draft a version
// tailored to specifics on request; these are the quick-copy defaults.

import type { FormLevel } from "../lib/db/forms";

export interface FormTemplateSeed {
  title: string;
  level: FormLevel;
  category: string;
  body: string;
}

export const FORM_TEMPLATES_DATA: FormTemplateSeed[] = [
  {
    title: "Transportation Request Form",
    level: "high_school",
    category: "Transportation",
    body: `TRANSPORTATION REQUEST FORM

School: ______________________________
Requested by: ______________________________          Date submitted: ____________

TRIP DETAILS
Sport/Activity: ______________________________
Opponent/Destination: ______________________________
Address: ______________________________
Departure date: ____________     Departure time: ____________
Return date: ____________          Estimated return time: ____________

PASSENGERS
Team/Group: ______________________________
Number of student-athletes: ______     Number of coaches/chaperones: ______
Vehicle type requested: [ ] Bus   [ ] Van   [ ] Other: ____________
Number of vehicles: ______

SPECIAL INSTRUCTIONS
Early dismissal needed: [ ] Yes  [ ] No     If yes, time: ____________
Meal stop required: [ ] Yes  [ ] No
Overnight stay: [ ] Yes  [ ] No     If yes, hotel/location: ____________
Other notes: ______________________________________________________

APPROVALS
Athletic Director signature: ______________________________     Date: ____________
Transportation Dept. confirmation: ______________________________     Date: ____________`,
  },
  {
    title: "Transportation Request Form",
    level: "college",
    category: "Transportation",
    body: `TEAM TRAVEL REQUEST FORM

Institution: ______________________________
Sport: ______________________________
Requested by: ______________________________          Date submitted: ____________

TRIP DETAILS
Opponent/Event: ______________________________
Destination (venue, city, state): ______________________________
Departure date/time: ____________     Return date/time: ____________
Mode of travel: [ ] Charter bus  [ ] Van fleet  [ ] Air  [ ] Other: ____________

TRAVEL PARTY
Student-athletes traveling: ______     Coaches/staff traveling: ______
Total travel party size: ______
Roster attached: [ ] Yes  [ ] No

LODGING (if overnight)
Hotel: ______________________________     Nights: ______     Rooms needed: ______
Per NCAA/conference travel policy: [ ] Confirmed compliant

BUDGET
Estimated total cost: $____________     Budget line/account: ____________

APPROVALS
Head Coach: ______________________________     Date: ____________
Athletic Director: ______________________________     Date: ____________
Business Office: ______________________________     Date: ____________`,
  },
  {
    title: "Contest / Game Contract",
    level: "high_school",
    category: "Contracts",
    body: `INTERSCHOLASTIC CONTEST CONTRACT

Home School: ______________________________
Visiting School: ______________________________
Sport: ______________________________     Level: [ ] Varsity  [ ] JV  [ ] Freshman  [ ] Other: ____________

Date of contest: ____________     Time: ____________
Location: ______________________________

FINANCIAL TERMS
Guarantee/fee (if any): $____________
Officials fees paid by: [ ] Home  [ ] Visitor  [ ] Split
Gate revenue split (if applicable): ____________

CANCELLATION / RESCHEDULING
Notice required to cancel without penalty: ______ days
Weather/emergency cancellation policy: per state association guidelines and mutual agreement between ADs.
Rescheduled date (if cancelled): ____________

OTHER TERMS
______________________________________________________
______________________________________________________

This contract becomes binding once both athletic directors sign below.

Home AD signature: ______________________________     Date: ____________
Visiting AD signature: ______________________________     Date: ____________`,
  },
  {
    title: "Contest / Game Contract",
    level: "college",
    category: "Contracts",
    body: `ATHLETIC CONTEST AGREEMENT

Institution A: ______________________________     Institution B: ______________________________
Sport: ______________________________     Season/Year: ____________

Date: ____________     Time: ____________     Site: ______________________________
Neutral site (if applicable): ______________________________

FINANCIAL TERMS
Guarantee to visiting institution: $____________
Payment terms/schedule: ______________________________
Officiating fees and assignment responsibility: ______________________________
Broadcast/streaming rights: ______________________________

CANCELLATION
Written notice required: ______ days
Force majeure clause: standard (weather, public health emergency, facility unavailability)
Liquidated damages for late cancellation (if any): $____________

COMPLIANCE
Both institutions affirm this contest complies with governing conference and NCAA/NAIA scheduling
requirements as applicable.

SIGNATURES
Institution A Athletic Director: ______________________________     Date: ____________
Institution B Athletic Director: ______________________________     Date: ____________
Institution A Business Office (if required): ______________________________     Date: ____________`,
  },
  {
    title: "Coach Evaluation Rubric",
    level: "high_school",
    category: "Evaluation",
    body: `COACH PERFORMANCE EVALUATION

Coach: ______________________________     Sport/Level: ______________________________
Season: ____________     Evaluator: ______________________________     Date: ____________

Rate each area 1 (needs improvement) – 5 (exemplary), with comments.

1. PROGRAM MANAGEMENT & ORGANIZATION
   Practice planning, roster/eligibility compliance, equipment care, budget adherence.
   Rating: ____     Comments: ______________________________

2. COACHING COMPETENCE
   Skill instruction, in-game strategy, player development, safety protocols followed.
   Rating: ____     Comments: ______________________________

3. STUDENT-ATHLETE RELATIONSHIPS
   Communication, fairness, motivation, handling of conflict.
   Rating: ____     Comments: ______________________________

4. PARENT & COMMUNITY RELATIONS
   Communication with parents, professionalism at contests, community representation.
   Rating: ____     Comments: ______________________________

5. RULES & CONDUCT COMPLIANCE
   Adherence to state association bylaws, sportsmanship, ejection/discipline record.
   Rating: ____     Comments: ______________________________

6. COLLABORATION WITH ATHLETIC DEPARTMENT
   Responsiveness, teamwork with other coaches/staff, follows department procedures.
   Rating: ____     Comments: ______________________________

OVERALL RATING: ____ / 5

STRENGTHS: ______________________________________________________

AREAS FOR GROWTH: ______________________________________________________

GOALS FOR NEXT SEASON: ______________________________________________________

Coach signature (acknowledges receipt, not necessarily agreement): ______________________________     Date: ____________
Evaluator signature: ______________________________     Date: ____________`,
  },
  {
    title: "Coach Evaluation Rubric",
    level: "college",
    category: "Evaluation",
    body: `COACHING STAFF ANNUAL EVALUATION

Coach: ______________________________     Position: ______________________________
Sport: ______________________________     Academic Year: ____________
Evaluator: ______________________________     Date: ____________

Rate each area 1 (needs improvement) – 5 (exemplary), with comments.

1. COMPETITIVE PERFORMANCE
   Win/loss record vs. expectations, conference/national standing, in-season adjustments.
   Rating: ____     Comments: ______________________________

2. RECRUITING
   Class quality, roster management, compliance with recruiting rules.
   Rating: ____     Comments: ______________________________

3. STUDENT-ATHLETE WELFARE & ACADEMIC PERFORMANCE
   Team GPA, eligibility/APR standing, retention/graduation contribution.
   Rating: ____     Comments: ______________________________

4. NCAA/CONFERENCE COMPLIANCE
   Rules education participation, self-reporting culture, violations record.
   Rating: ____     Comments: ______________________________

5. BUDGET & OPERATIONS MANAGEMENT
   Budget adherence, equipment/facility stewardship, staff supervision.
   Rating: ____     Comments: ______________________________

6. PROGRAM CULTURE & CONDUCT
   Sportsmanship, media/public conduct, staff and student-athlete relations.
   Rating: ____     Comments: ______________________________

OVERALL RATING: ____ / 5

STRENGTHS: ______________________________________________________

AREAS FOR GROWTH: ______________________________________________________

GOALS FOR NEXT YEAR: ______________________________________________________

Coach signature (acknowledges receipt): ______________________________     Date: ____________
Athletic Director signature: ______________________________     Date: ____________`,
  },
  {
    title: "Season Kickoff Letter to Parents",
    level: "high_school",
    category: "Communication",
    body: `Dear [Team/Sport] Families,

Welcome to the [season/year] season! We're excited to have your student-athlete as part of our program.
A few things to know as we get started:

SCHEDULE
Practices: [days/times/location]
Games begin: [date] — full schedule attached/posted at [link]

WHAT TO BRING
[Equipment/uniform/physical form details]

ELIGIBILITY REMINDERS
To remain eligible, student-athletes must maintain [state association academic standard] and follow all
team and school conduct expectations. Please reach out early if you have questions about eligibility —
we'd rather catch an issue in week one than week six.

COMMUNICATION
The fastest way to reach the coaching staff is [email/app]. For anything involving eligibility, transfers,
or a formal concern, please contact me directly at [AD email/phone].

TRANSPORTATION
[Bus schedule / pickup details for away contests]

We're looking forward to a great season. Thank you for trusting us with your student-athlete.

[Signature]`,
  },
  {
    title: "Season Kickoff Letter to Families",
    level: "college",
    category: "Communication",
    body: `Dear [Sport] Families,

On behalf of our coaching staff and athletic department, welcome to the [season/year] season.

PROGRAM CONTACTS
Head Coach: [name/email/phone]
Athletic Trainer: [name/email/phone]
Academic Support/Athletics Liaison: [name/email/phone]
Athletic Director's Office: [name/email/phone]

ACADEMIC EXPECTATIONS
Student-athletes are expected to meet [institution]'s and [conference/NCAA]'s academic eligibility
standards. Our academic support team is available at [contact] for tutoring and study hall scheduling.

COMPETITION SCHEDULE
Full schedule and ticket information: [link]

TRAVEL & COMMUNICATION
Travel itineraries are shared with student-athletes directly; families can find the public schedule at
[link]. For urgent matters while the team is traveling, contact [emergency contact].

COMPLIANCE
Reminder: NCAA rules restrict certain forms of benefits and involvement from boosters and family members
in recruiting-adjacent activity. Questions about what's permissible should go to our Compliance Office at
[contact] before, not after.

We're glad to have your student-athlete in our program and look forward to a strong season.

[Signature]`,
  },
  {
    title: "Emergency Action Plan Template",
    level: "high_school",
    category: "Safety",
    body: `EMERGENCY ACTION PLAN — [Sport/Facility Name]

FACILITY: ______________________________     ADDRESS: ______________________________

EMERGENCY CONTACTS
911 / Local EMS: 911
Athletic Trainer: ______________________________
School Nurse: ______________________________
Athletic Director: ______________________________
Building Administrator: ______________________________

NEAREST HOSPITAL
Name: ______________________________     Address: ______________________________
Driving directions from facility: ______________________________

ON-SITE EMERGENCY EQUIPMENT
AED location: ______________________________
First aid kit location: ______________________________
Spine board / splint kit location (if applicable): ______________________________

RESPONSE ROLES (assign before each event)
1. Immediate care of injured/ill person: ______________________________
2. Call 911 and direct EMS to the facility: ______________________________
3. Retrieve emergency equipment (AED/first aid): ______________________________
4. Meet EMS at the designated entrance and guide them in: ______________________________
5. Crowd/scene control: ______________________________
6. Notify administration and parent/guardian: ______________________________

DESIGNATED EMS ENTRANCE
______________________________________________________

WEATHER EMERGENCY PROTOCOL
Lightning: suspend activity when thunder is heard or lightning is seen; resume no sooner than 30 minutes
after the last strike/thunder.
Heat: follow [state association] heat acclimatization and wet-bulb globe temperature guidelines.
Shelter location: ______________________________

This plan should be reviewed with all coaching staff before each season and posted at the facility.

Reviewed by: ______________________________     Date: ____________`,
  },
  {
    title: "Emergency Action Plan Template",
    level: "college",
    category: "Safety",
    body: `EMERGENCY ACTION PLAN — [Venue/Facility Name]

VENUE: ______________________________     ADDRESS: ______________________________
SPORTS COVERED: ______________________________

EMERGENCY CONTACTS
911 / Campus EMS: ______________________________
Head Athletic Trainer: ______________________________
Team Physician: ______________________________
Athletic Director: ______________________________
Campus Police/Safety: ______________________________

NEAREST TRAUMA/EMERGENCY CENTER
Name: ______________________________     Address: ______________________________
Transport time by ground: ______ min     Air-medical option (if remote): [ ] Yes  [ ] No

EMERGENCY EQUIPMENT LOCATIONS
AED: ______________________________
Spine board / immobilization equipment: ______________________________
Vacuum splints: ______________________________
Emergency medical bag: ______________________________

RESPONSE ROLES (assign per event/practice)
1. Primary care provider (certified AT or team physician on site): ______________________________
2. Activate EMS (call and stay on line): ______________________________
3. Retrieve emergency equipment: ______________________________
4. Direct EMS to venue via designated entrance: ______________________________
5. Crowd control / clear the area: ______________________________
6. Notify sport administrator, compliance (if reportable), and family: ______________________________

DESIGNATED EMS ENTRANCE
______________________________________________________

ENVIRONMENTAL PROTOCOLS
Lightning, heat/WBGT, cold — per conference and NCAA sports medicine guidelines currently in effect.

This plan is reviewed annually with all sports medicine and coaching staff and posted at the venue.

Reviewed by: ______________________________     Date: ____________`,
  },
  {
    title: "Program Budget Worksheet",
    level: "high_school",
    category: "Budget",
    body: `ANNUAL PROGRAM BUDGET WORKSHEET

Sport/Program: ______________________________     Season/Year: ____________
Head Coach: ______________________________     Prepared by: ______________________________

REVENUE
Athletic department allocation: $____________
Booster club contribution: $____________
Gate receipts (est.): $____________
Fundraising (est.): $____________
Other: $____________
TOTAL REVENUE: $____________

EXPENSES
Coaching stipends: $____________
Officials fees: $____________
Transportation: $____________
Uniforms/equipment: $____________
Facility rental/maintenance: $____________
Tournament/entry fees: $____________
Awards/banquet: $____________
Medical/training supplies: $____________
Other: $____________
TOTAL EXPENSES: $____________

NET (Revenue − Expenses): $____________

NOTES / JUSTIFICATION FOR MAJOR LINE ITEMS
______________________________________________________
______________________________________________________

Approved by Athletic Director: ______________________________     Date: ____________`,
  },
  {
    title: "Program Budget Worksheet",
    level: "college",
    category: "Budget",
    body: `SPORT PROGRAM BUDGET WORKSHEET

Sport: ______________________________     Fiscal Year: ____________
Head Coach: ______________________________     Prepared by: ______________________________

REVENUE
Institutional allocation: $____________
Conference distribution: $____________
Ticket/gate revenue (est.): $____________
Fundraising/development: $____________
Sponsorship/NIL collective support (if applicable, non-institutional): $____________
Other: $____________
TOTAL REVENUE: $____________

EXPENSES
Staff salaries/stipends: $____________
Recruiting travel: $____________
Team travel (transportation, lodging, meals): $____________
Officiating/game operations: $____________
Equipment/uniforms: $____________
Facility operations & maintenance: $____________
Sports medicine/medical: $____________
Scholarships (if tracked separately, note here for reference): $____________
Camps/clinics: $____________
Other: $____________
TOTAL EXPENSES: $____________

NET (Revenue − Expenses): $____________

NOTES / JUSTIFICATION FOR MAJOR LINE ITEMS
______________________________________________________
______________________________________________________

Approved by Athletic Director: ______________________________     Date: ____________
Approved by Business Office: ______________________________     Date: ____________`,
  },
];

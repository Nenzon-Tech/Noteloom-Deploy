/**
 * NoteLoom Backend — Feature E2E Flow Test
 *
 * Verifies the REAL create → consume flows the app depends on:
 *   1. Faculty creates a classroom
 *   2. Faculty creates a module inside the classroom
 *   3. Faculty uploads content (real file, real multipart) into the module
 *   4. Student enrolls and SEES the uploaded content
 *   5. Student marks content complete (progress recorded)
 *   6. College Admin creates a department that is then visible in the list
 *   7. Cleanup: deletes classroom, content and department
 *
 * Run with:  node scripts/e2e-features.js
 * Requires:  local backend running on port 4000 (npm run dev)
 * Node 18+ (uses global fetch / FormData / Blob).
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const COLLEGE_CODE = process.env.COLLEGE_CODE || '1001';
const TS = Date.now();

// ─── Colour helpers ──────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m✅';
const RED    = '\x1b[31m❌';
const YELLOW = '\x1b[33m⚠️ ';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

// ─── Shared state ────────────────────────────────────────────────────────────
const state = {
  facultyToken: null, facultyUid: null,
  studentToken: null, studentUid: null,
  adminToken: null,
  classroomId: null, moduleId: null, contentId: null,
  departmentId: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function req(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  // NOTE: do NOT set Content-Type for multipart form — fetch() must generate the
  // boundary itself, otherwise busboy/multer rejects the upload ("Boundary not found").

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  if (form) options.body = form;

  const res = await fetch(BASE_URL + path, options);
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, body: data };
}

let passed = 0, failed = 0, warned = 0;
const results = [];

async function test(label, fn) {
  try {
    const result = await fn();
    if (result === 'SKIP') {
      console.log(`${YELLOW} SKIP${RESET}  ${DIM}${label}${RESET}`);
      warned++;
      results.push({ label, status: 'SKIP' });
    } else {
      console.log(`${GREEN}${RESET}  ${label}`);
      passed++;
      results.push({ label, status: 'PASS' });
    }
  } catch (e) {
    console.log(`${RED}${RESET}  ${label}`);
    console.log(`         ${DIM}→ ${e.message}${RESET}`);
    failed++;
    results.push({ label, status: 'FAIL', error: e.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ─── Signup helpers ──────────────────────────────────────────────────────────
async function signup(role, extra) {
  const email = `e2e_${role}_${TS}@noteloom-e2e.com`;
  const base = {
    email, password: 'Password@123',
    fullName: `E2E ${role}`,
    role, collegeCode: COLLEGE_CODE,
  };
  const r = await req('POST', '/api/auth/role-signup', { body: { ...base, ...extra } });
  assert([200, 400].includes(r.status), `Signup ${role} got ${r.status}: ${JSON.stringify(r.body)}`);
  if (r.status === 400 && r.body.error === 'User already registered') {
    // Reuse the existing sign-in instead — treat as ok, signin below will fail,
    // so bail out loudly.
    throw new Error(`E2E user ${email} already exists — delete it or bump TS`);
  }
  assert(r.body.uid, 'Signup did not return a UID');
  return { email, uid: r.body.uid };
}

async function signin(email, role) {
  const r = await req('POST', '/api/auth/signin', {
    body: { email, password: 'Password@123', collegeCode: COLLEGE_CODE },
  });
  assert(r.status === 200, `Signin ${role} got ${r.status}: ${JSON.stringify(r.body)}`);
  assert(r.body.sessionToken, 'Signin returned no sessionToken');
  return r.body.sessionToken;
}

// ─── Flow: Faculty creates + uploads ─────────────────────────────────────────
async function facultyCreatesClassroom() {
  console.log(`\n${BOLD}[ A ] FACULTY CREATES CLASSROOM${RESET}`);
  const r = await req('POST', '/api/classrooms', {
    token: state.facultyToken,
    body: {
      subjectName: `E2E Physics ${TS}`,
      subjectCode: `E2EP${TS.toString().slice(-4)}`,
      batchYear: 2025,
      stream: 'Computer Science & Engineering',
      semester: 3,
      addMode: 'later',
    },
  });
  assert(r.status === 200, `Create classroom got ${r.status}: ${JSON.stringify(r.body)}`);
  assert(r.body._id, 'No classroom _id returned');
  state.classroomId = r.body._id;
}

async function facultyListsClassroom() {
  const r = await req('GET', '/api/classrooms', { token: state.facultyToken });
  assert(r.status === 200, `List classrooms got ${r.status}`);
  assert(Array.isArray(r.body), 'Expected an array');
  assert(r.body.some(c => c._id === state.classroomId), 'Faculty cannot see their created classroom');
}

async function facultyCreatesModule() {
  console.log(`\n${BOLD}[ B ] FACULTY CREATES MODULE${RESET}`);
  const r = await req('POST', `/api/classrooms/${state.classroomId}/modules`, {
    token: state.facultyToken,
    body: { title: 'Unit 1: Kinematics' },
  });
  assert(r.status === 200, `Create module got ${r.status}: ${JSON.stringify(r.body)}`);
  assert(r.body._id, 'No module _id returned');
  state.moduleId = r.body._id;
}

async function facultyUploadsContent() {
  console.log(`\n${BOLD}[ C ] FACULTY UPLOADS CONTENT (multipart)${RESET}`);
  const form = new FormData();
  form.append('title', 'Lecture Notes: Kinematics');
  form.append('description', 'E2E uploaded note');
  form.append('type', 'note');
  form.append('allowDownload', 'true');
  form.append('files', new Blob(['E2E test note content'], { type: 'text/plain' }), 'kinematics-notes.txt');

  const r = await req('POST', `/api/modules/${state.moduleId}/content`, {
    token: state.facultyToken,
    form,
  });
  assert(r.status === 200, `Upload content got ${r.status}: ${JSON.stringify(r.body).substring(0, 200)}`);
  assert(r.body._id, 'No content _id returned');
  state.contentId = r.body._id;
}

async function studentEnrollsInClassroom() {
  console.log(`\n${BOLD}[ D ] STUDENT ENROLLS${RESET}`);
  const r = await req('POST', `/api/classrooms/${state.classroomId}/enroll`, {
    token: state.facultyToken,
    body: { uid: state.studentUid },
  });
  assert(r.status === 200, `Enroll student got ${r.status}: ${JSON.stringify(r.body)}`);
}

async function studentSeesContent() {
  console.log(`\n${BOLD}[ E ] STUDENT SEES CONTENT${RESET}`);
  const r = await req('GET', `/api/modules/${state.moduleId}/content`, { token: state.studentToken });
  assert(r.status === 200, `Student get content got ${r.status}: ${JSON.stringify(r.body)}`);
  assert(Array.isArray(r.body) && r.body.length > 0, 'Student sees no content');
  assert(r.body.some(c => c._id === state.contentId), 'Uploaded content not visible to student');
}

async function studentMarksComplete() {
  const r = await req('POST', `/api/content/${state.contentId}/complete`, {
    token: state.studentToken,
    body: { isCompleted: true },
  });
  assert(r.status === 200, `Mark complete got ${r.status}: ${JSON.stringify(r.body)}`);

  const detail = await req('GET', `/api/content/${state.contentId}`, { token: state.studentToken });
  assert(detail.status === 200, `Content detail got ${detail.status}`);
  assert(detail.body.isCompleted === true, 'Progress not recorded (isCompleted !== true)');
}

async function studentListsClassroom() {
  const r = await req('GET', '/api/classrooms', { token: state.studentToken });
  assert(r.status === 200, `Student list got ${r.status}`);
  assert(r.body.some(c => c._id === state.classroomId), 'Enrolled classroom not in student list');
}

// ─── Flow: Admin adds department ─────────────────────────────────────────────
async function adminAddsDepartment() {
  console.log(`\n${BOLD}[ F ] ADMIN ADDS DEPARTMENT${RESET}`);
  const name = `E2E Dept ${TS}`;
  const r = await req('POST', '/api/departments', {
    token: state.adminToken,
    body: { name, code: `E2E${TS.toString().slice(-4)}` },
  });
  assert(r.status === 200, `Create department got ${r.status}: ${JSON.stringify(r.body)}`);
  assert(r.body._id, 'No department _id returned');
  state.departmentId = r.body._id;

  const list = await req('GET', '/api/departments', { token: state.adminToken });
  assert(list.status === 200, `List departments got ${list.status}`);
  assert(list.body.some(d => d._id === state.departmentId), 'New department not in list');
}

// ─── Flow: Student self-service endpoints (mobile feature gaps) ──────────────
async function studentSelfService() {
  console.log(`\n${BOLD}[ H ] STUDENT SELF-SERVICE (my-records / feedback / my-results)${RESET}`);

  // 0. Resolve the student's User _id from the session
  const info = await req('GET', '/session/info', { token: state.studentToken });
  assert(info.status === 200, `Session info got ${info.status}: ${JSON.stringify(info.body)}`);
  assert(info.body.user && info.body.user.id, 'Session info missing user.id');
  state.studentUserId = info.body.user.id;

  // 1. Feedback data provides subjects
  const data = await req('GET', `/api/coe/student/feedback-data/${state.studentUserId}`, { token: state.studentToken });
  assert(data.status === 200, `Feedback data got ${data.status}: ${JSON.stringify(data.body)}`);
  assert(data.body.subjects && Array.isArray(data.body.subjects), 'Feedback data missing subjects array');

  // 2. Submit feedback (real subject if present, else a synthetic id to exercise the route)
  const subject = data.body.subjects && data.body.subjects[0]
    ? data.body.subjects[0]
    : { id: TS.toString(16).padStart(24, '0').slice(0, 24), code: 'E2E', semester: 1 };
  const submit = await req('POST', '/api/coe/student/submit-feedback', {
    token: state.studentToken,
    body: { subjectId: subject.id, subjectCode: subject.code, semester: subject.semester, rating: 5, comments: 'E2E feedback' },
  });
  assert(submit.status === 200, `Submit feedback got ${submit.status}: ${JSON.stringify(submit.body)}`);
  assert(submit.body.success === true, 'Submit feedback did not return success');

  // 3. Feedback data now reflects submitted status
  const data2 = await req('GET', `/api/coe/student/feedback-data/${state.studentUserId}`, { token: state.studentToken });
  assert(data2.status === 200, `Feedback data (2) got ${data2.status}`);
  const updated = data2.body.subjects.find(s => s.id === subject.id);
  assert(!updated || updated.feedbackSubmitted === true, 'Submitted status not reflected after submit');

  // 4. Student's own attendance records (empty is fine — no classes yet)
  const att = await req('GET', '/api/attendance/my-records', { token: state.studentToken });
  assert(att.status === 200, `My attendance got ${att.status}: ${JSON.stringify(att.body)}`);
  assert(Array.isArray(att.body.records), 'My attendance missing records array');

  // 5. Student's own published results (empty is fine — none published)
  const res = await req('GET', '/api/coe/my-results', { token: state.studentToken });
  assert(res.status === 200, `My results got ${res.status}: ${JSON.stringify(res.body)}`);
  assert(Array.isArray(res.body.results), 'My results missing results array');
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log(`\n${BOLD}[ G ] CLEANUP${RESET}`);
  if (state.contentId) {
    await req('DELETE', `/api/content/${state.contentId}`, { token: state.facultyToken });
  }
  if (state.classroomId) {
    await req('DELETE', `/api/classrooms/${state.classroomId}`, { token: state.facultyToken });
  }
  if (state.departmentId) {
    await req('DELETE', `/api/departments/${state.departmentId}`, { token: state.adminToken });
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${BOLD}  NoteLoom Backend — Feature E2E Flow Test${RESET}`);
  console.log('  Target: ' + BASE_URL);
  console.log('  College: ' + COLLEGE_CODE);
  console.log(`${'═'.repeat(60)}`);

  const reach = await req('GET', '/health');
  if (reach.status === 0) {
    console.log(`\n${RED} FATAL${RESET}: Cannot reach ${BASE_URL}`);
    console.log('  Make sure the server is running: npm run dev\n');
    process.exit(1);
  }

  await test('Sign up faculty', async () => {
    const { uid } = await signup('faculty', { department: 'Physics', designation: 'Professor', qualification: 'Ph.D', employeeId: `FAC-E2E-${TS}` });
    state.facultyUid = uid;
  });
  await test('Sign in faculty', async () => { state.facultyToken = await signin(`e2e_faculty_${TS}@noteloom-e2e.com`, 'faculty'); });

  await test('Sign up student', async () => {
    const { uid } = await signup('student', { phoneNumber: '9876543210', gender: 'Male', admissionYear: 2025, course: 'B.Tech', stream: 'Computer Science & Engineering', year: '2nd', rollNo: `E2E-${TS}`, currentSemester: 3 });
    state.studentUid = uid;
  });
  await test('Sign in student', async () => { state.studentToken = await signin(`e2e_student_${TS}@noteloom-e2e.com`, 'student'); });

  await test('Sign up college admin', async () => {
    await signup('college_admin', { adminLevel: 'College Admin', employeeId: `ADM-E2E-${TS}`, responsibilities: 'System Administration' });
  });
  await test('Sign in college admin', async () => { state.adminToken = await signin(`e2e_college_admin_${TS}@noteloom-e2e.com`, 'college_admin'); });

  if (failed > 0) {
    console.log(`\n${RED} Aborting: sign-in phase failed${RESET}`);
    printResults();
    process.exit(1);
  }

  await test('Faculty creates a classroom', facultyCreatesClassroom);
  await test('Faculty sees classroom in list', facultyListsClassroom);
  await test('Faculty creates a module', facultyCreatesModule);
  await test('Faculty uploads content file', facultyUploadsContent);
  await test('Student enrolls in classroom', studentEnrollsInClassroom);
  await test('Student sees the uploaded content', studentSeesContent);
  await test('Student marks content complete (progress saved)', studentMarksComplete);
  await test('Student sees classroom in their list', studentListsClassroom);
  await test('Admin creates department, visible in list', adminAddsDepartment);
  await test('Student self-service endpoints (feedback / my-records / my-results)', studentSelfService);

  await cleanup();

  printResults();
}

function printResults() {
  const total = passed + failed + warned;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`${BOLD}  RESULTS${RESET}`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  ${GREEN}${RESET}  Passed  : ${passed}`);
  console.log(`  ${RED}${RESET}  Failed  : ${failed}`);
  console.log(`  ${YELLOW}${RESET}  Skipped : ${warned}`);
  console.log(`  Total   : ${total}`);
  console.log(`${'═'.repeat(60)}\n`);

  if (failed > 0) {
    console.log(`${RED} FAILURES:${RESET}`);
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ${RED}${RESET} ${r.label}`);
      console.log(`      ${DIM}${r.error}${RESET}`);
    });
    console.log('');
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('E2E runner crashed:', e);
  process.exit(1);
});
